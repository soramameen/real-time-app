import { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  type: "sent" | "received";
  text: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      "ws://real-time-app-f218663aca6f.herokuapp.com/ws"
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = event.data;
      setMessages((prev) => [...prev, { type: "received", text: data }]);
    };

    ws.onclose = () => {
      console.log("WebSocket接続が切断されました");
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSend = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // サーバーにメッセージを送信
      wsRef.current.send(inputMsg);

      // 自分で送ったメッセージはサーバーからの受信を待たずに表示
      setMessages((prev) => [...prev, { type: "sent", text: inputMsg }]);
      setInputMsg(""); // 入力欄をクリア
    } else {
      console.error("WebSocketが接続されていません");
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">LINE風チャット</header>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.type === "sent" ? "sent" : "received"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <footer className="chat-input">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="メッセージを入力"
        />
        <button onClick={handleSend}>送信</button>
      </footer>
    </div>
  );
}

export default App;
