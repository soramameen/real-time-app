import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState<string>(""); // ユーザーの名前
  const [nameInput, setNameInput] = useState<string>("");

  const [messages, setMessages] = useState<
    { id: string; name: string; text: string }[]
  >([]);
  const [inputMsg, setInputMsg] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const clientId = useRef<string>(crypto.randomUUID()); // 一意のIDを生成

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    wsRef.current = ws;

    // サーバーからメッセージを受信
    ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      setMessages((prev) => [...prev, receivedData]); // サーバーから受信したメッセージを追加
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
      const message = { id: clientId.current, name, text: inputMsg }; // 名前を含むメッセージ
      wsRef.current.send(JSON.stringify(message)); // サーバーに送信
      setMessages((prev) => [...prev, message]); // 自分のメッセージを即座に表示
      setInputMsg("");
    } else {
      console.error("WebSocketが接続されていません");
    }
  };

  if (!name) {
    // 名前登録のUIを表示
    return (
      <div className="name-container">
        <h2>名前を入力してください</h2>
        <input
          className="name-input"
          type="text"
          placeholder="名前を入力"
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button
          onClick={() => {
            if (nameInput.trim()) {
              setName(nameInput.trim()); // 名前をセット
            } else {
              console.log("名前が空です");
            }
          }}
        >
          登録
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">LINE風チャット {name}さんのトーク画面</div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.id === clientId.current ? "sent" : "received"
            }`}
          >
            <span className="message-name">{msg.name}</span>: {msg.text}
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
