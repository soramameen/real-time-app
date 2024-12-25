import { useState, useEffect, useRef } from "react";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      "wss://real-time-app-f218663aca6f.herokuapp.com/ws"
    );
    wsRef.current = ws;

    // サーバーからメッセージを受信
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
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
      wsRef.current.send(inputMsg);
      setInputMsg(""); // 入力欄をクリア
    } else {
      console.error("WebSocketが接続されていません");
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={inputMsg}
        onChange={(e) => setInputMsg(e.target.value)}
      />
      <button onClick={handleSend}>送信</button>
    </div>
  );
}

export default App;
