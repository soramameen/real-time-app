package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

// 接続されたクライアントを管理するマップ
var clients = make(map[*websocket.Conn]bool)

// メッセージをブロードキャストするためのチャネル
var broadcast = make(chan Message)

// WebSocketのアップグレード用
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // CORSを許可
	},
}

// メッセージ構造体
type Message struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

// WebSocketハンドラー
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocketアップグレードエラー:", err)
		return
	}
	defer conn.Close()

	// 新しいクライアントを登録
	clients[conn] = true
	log.Println("クライアントが接続しました")

	// クライアントからのメッセージを受信
	for {
		var msg Message
		err := conn.ReadJSON(&msg) // JSON形式でメッセージを受信
		if err != nil {
			log.Println("メッセージ受信エラー:", err)
			delete(clients, conn) // クライアントを削除
			break
		}
		log.Printf("受信メッセージ: %+v\n", msg)

		// メッセージをブロードキャストチャネルに送信
		broadcast <- msg
	}
}

// メッセージを全クライアントにブロードキャストする
func handleBroadcast() {
	for {
		// ブロードキャストチャネルからメッセージを受信
		msg := <-broadcast

		// 登録されたすべてのクライアントに送信
		for client := range clients {
			err := client.WriteJSON(msg) // JSON形式で送信
			if err != nil {
				log.Println("メッセージ送信エラー:", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("$PORT must be set")
	}

	// ブロードキャスト処理をゴルーチンで起動
	go handleBroadcast()

	http.HandleFunc("/ws", handleWebSocket)

	fmt.Printf("WebSocketサーバー起動: http://localhost:%s/ws\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
