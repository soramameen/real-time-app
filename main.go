package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
	_ "github.com/mattn/go-sqlite3"
)

// メッセージ構造体
type Message struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Text string `json:"text"`
}

// WebSocketアップグレード用
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // 開発中のCORS許可
	},
}

// データベース接続
var db *sql.DB

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./chat.db")
	if err != nil {
		log.Fatal("データベース接続エラー:", err)
	}

	// メッセージテーブル作成
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS messages (
		id TEXT,
		name TEXT,
		text TEXT
	);`
	_, err = db.Exec(createTableQuery)
	if err != nil {
		log.Fatal("テーブル作成エラー:", err)
	}
}

// メッセージをデータベースに保存
func saveMessage(msg Message) {
	_, err := db.Exec("INSERT INTO messages (id, text) VALUES (?, ?)", msg.ID, msg.Text)
	if err != nil {
		log.Println("メッセージ保存エラー:", err)
	}
}

// 過去のメッセージを取得
func loadMessages() ([]Message, error) {
	rows, err := db.Query("SELECT id, text FROM messages")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		err := rows.Scan(&msg.ID, &msg.Text)
		if err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, nil
}

// WebSocketハンドラー
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocketアップグレードエラー:", err)
		return
	}
	defer conn.Close()

	// 過去のメッセージを送信
	messages, err := loadMessages()
	if err == nil {
		for _, msg := range messages {
			err := conn.WriteJSON(msg)
			if err != nil {
				log.Println("過去メッセージ送信エラー:", err)
				break
			}
		}
	}

	// 新しいメッセージの処理
	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("メッセージ受信エラー:", err)
			break
		}

		// メッセージを保存
		saveMessage(msg)

		// メッセージを全クライアントに送信
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Println("メッセージ送信エラー:", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

var clients = make(map[*websocket.Conn]bool)

func main() {
	initDB()

	http.HandleFunc("/ws", handleWebSocket)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("サーバー起動: http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
