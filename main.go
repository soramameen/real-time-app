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
var broadcast = make(chan []byte)

// WebSocketのアップグレード用
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // CORSを許可（本番環境では適切に制限）
	},
}

// WebSocketハンドラー
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// HTTP接続をWebSocketにアップグレード
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
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("受信エラー:", err)
			delete(clients, conn)
			break
		}
		log.Printf("受信メッセージ: %s\n", msg)

		// メッセージをブロードキャストチャネルに送信
		broadcast <- msg
	}
}

// メッセージを全クライアントにブロードキャストする
func handleBroadcast() {
	for {
		// ブロードキャストチャネルからメッセージを受信
		msg := <-broadcast

		// 全クライアントに送信
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				log.Println("メッセージ送信エラー:", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func main() {
	// 環境変数 PORT を取得
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("$PORT must be set") // Herokuでは$PORTが必要
	}

	// ブロードキャスト処理をゴルーチンで起動
	go handleBroadcast()

	// WebSocketエンドポイント
	http.HandleFunc("/ws", handleWebSocket)

	// サーバー起動
	fmt.Printf("WebSocketサーバー起動: http://localhost:%s/ws\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
