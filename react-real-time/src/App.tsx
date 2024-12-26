import { useState, useEffect, useRef } from "react";
import Login from "./components/Login";
import Header from "./components/Header";
import PostComponent from "./components/PostComponent";
import Contents from "./components/Contents";
interface data {
  id: string;
  name: string;
  text: string;
}
function App() {
  const [name, setName] = useState<string>(""); // ユーザーの名前
  const [nameInput, setNameInput] = useState<string>(""); //setするため
  const [messages, setMessages] = useState<data[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const clientId = useRef<string>(crypto.randomUUID()); // 一意のIDを生成
  const socketUrl = "wss://real-time-app-f218663aca6f.herokuapp.com/ws";
  useEffect(() => {
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      console.log("受信したデータ:", receivedData);
      // 自分が送信したメッセージでなければ追加
      if (receivedData.id !== clientId.current) {
        setMessages((prev) => [...prev, receivedData]);
      }
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
      const message = { id: clientId.current, name: name, text: inputMsg };
      wsRef.current.send(JSON.stringify(message));
      setMessages((prev) => [...prev, message]);
      setInputMsg("");
    } else {
      console.error("WebSocketが接続されていません");
    }
  };

  return (
    <>
      {!name && (
        <Login
          setName={setName}
          nameInput={nameInput}
          setNameInput={setNameInput}
        />
      )}

      <div className="flex flex-col h-screen bg-gray-100">
        <Header name={name} setName={setName} />
        <Contents messages={messages} name={name} />
        <PostComponent
          inputMsg={inputMsg}
          setInputMsg={setInputMsg}
          handleSend={handleSend}
        />
      </div>
    </>
  );
}

export default App;
