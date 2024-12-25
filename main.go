package main

import (
	"fmt"
	"log"
	"net/http"

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
    http.HandleFunc("/ws", handleWebSocket)

    fmt.Println("WebSocketサーバー起動: http://localhost:8080/ws")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
