import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<{ id: string; text: string }[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const clientId = useRef<string>(crypto.randomUUID()); // 初期値としてUUIDを生成

  useEffect(() => {
    const ws = new WebSocket("wss://your-websocket-server/ws");
    wsRef.current = ws;

    // サーバーからメッセージを受信
    ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      setMessages((prev) => [...prev, receivedData]);
    };

    ws.onclose = () => {
      console.log("WebSocket接続が切断されました");
    };

    return () => {
      ws.close();
    };
  }, []);

  // メッセージ送信
  const handleSend = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = { id: clientId.current, text: inputMsg };
      wsRef.current.send(JSON.stringify(message));
      setInputMsg("");
    } else {
      console.error("WebSocketが接続されていません");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">LINE風チャット</div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.id === clientId.current ? "sent" : "received"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          className="chat-input-box"
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="メッセージを入力"
        />
        <button className="chat-send-button" onClick={handleSend}>
          送信
        </button>
      </div>
    </div>
  );
}

export default App;
