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
		return true // 必要ならCORSを許可
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

	log.Println("クライアント接続成功")

	// クライアントからのメッセージを受信してそのまま返す
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("受信エラー:", err)
			break
		}
		log.Printf("受信メッセージ: %s\n", msg)

		// メッセージをクライアントに返す
		err = conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Println("送信エラー:", err)
			break
		}
	}
}

func main() {
	// 環境変数 PORT を取得
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("$PORT must be set") // Herokuでは$PORTが必要
	}

	http.HandleFunc("/ws", handleWebSocket) // WebSocketエンドポイント

	// サーバー起動
	fmt.Printf("WebSocketサーバー起動: http://localhost:%s/ws\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
