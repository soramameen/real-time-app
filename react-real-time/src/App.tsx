import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid"; // UUIDを生成するためのライブラリ
import "./App.css"; // CSSをインポート

function App() {
  const [messages, setMessages] = useState<{ id: string; text: string }[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const clientId = useRef(uuidv4()); // クライアントごとに一意のIDを生成

  useEffect(() => {
    const ws = new WebSocket(
      "wss://real-time-app-f218663aca6f.herokuapp.com/ws"
    );
    wsRef.current = ws;

    // サーバーからメッセージを受信
    ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data); // JSON形式で受信
      setMessages((prev) => [...prev, receivedData]);
    };

    // WebSocket接続が切断されたとき
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
      const message = { id: clientId.current, text: inputMsg }; // IDを付与したメッセージ
      wsRef.current.send(JSON.stringify(message)); // サーバーにJSON形式で送信
      setInputMsg(""); // 入力欄をクリア
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
              msg.id === clientId.current ? "sent" : "received" // 自分のIDに基づいて区別
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
