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

// クライアントを表す構造体
type Client struct {
	conn *websocket.Conn
	send chan []byte
}

// 接続されている全クライアントを管理
var clients = make(map[*Client]bool)

// メッセージをブロードキャストするためのチャネル
var broadcast = make(chan []byte)

func main() {
	// メッセージを処理するゴルーチン
	go handleMessages()

	// WebSocketエンドポイントを定義
	http.HandleFunc("/ws", handleWebSocket)

	fmt.Println("WebSocketサーバー起動: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// WebSocket接続を処理
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// HTTP接続をWebSocketにアップグレード
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("アップグレードエラー:", err)
		return
	}
	defer conn.Close()

	// 新しいクライアントを作成
	client := &Client{
		conn: conn,
		send: make(chan []byte),
	}

	// クライアントを登録
	clients[client] = true

	// クライアントの受信・送信処理を並行して実行
	go client.readPump()
	go client.writePump()

	// クライアントが切断されたら削除
	defer func() {
		delete(clients, client)
		close(client.send)
	}()
}

// クライアントのメッセージ受信処理
func (c *Client) readPump() {
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			log.Println("メッセージ受信エラー:", err)
			break
		}
		// 受信したメッセージをブロードキャストチャネルへ送る
		broadcast <- message
	}
}

// クライアントのメッセージ送信処理
func (c *Client) writePump() {
	for message := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Println("メッセージ送信エラー:", err)
			break
		}
	}
}

// メッセージを全クライアントにブロードキャスト
func handleMessages() {
	for {
		// broadcastチャネルからメッセージを受け取る
		message := <-broadcast
		// すべてのクライアントに送信
		for client := range clients {
			client.send <- message
		}
	}
}
