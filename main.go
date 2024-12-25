package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

// WebSocketのアップグレード用
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // 開発中のCORSを許可
	},
}

// WebSocketハンドラー
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// HTTP接続をWebSocketにアップグレード
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("アップグレードエラー:", err)
		return
	}
	defer conn.Close()

	log.Println("クライアント接続成功")

	for {
		// クライアントからのメッセージを受信
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("受信エラー:", err)
			break
		}
		log.Printf("受信メッセージ: %s\n", msg)

		// メッセージをそのまま送り返す
		if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			log.Println("送信エラー:", err)
			break
		}
	}
}

func main() {
	// ポート番号を環境変数から取得
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // デフォルトポート番号
	}

	http.HandleFunc("/ws", handleWebSocket)

	fmt.Printf("WebSocketサーバー起動: http://localhost:%s/ws\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
