import { useState, useEffect, useRef } from "react";

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
    const ws = new WebSocket(
      "wss://real-time-app-f218663aca6f.herokuapp.com/ws"
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      console.log("受信したデータ:", receivedData);
      setMessages((prev) => [...prev, receivedData]);
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

  if (!name) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-4">名前を入力してください</h2>
          <input
            className="w-full p-2 border rounded mb-4"
            type="text"
            placeholder="名前を入力"
            onChange={(e) => setNameInput(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={() => {
              if (nameInput.trim()) {
                setName(nameInput.trim());
              } else {
                console.log("名前が空です");
              }
            }}
          >
            登録
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-green-500 text-white p-4 text-lg font-semibold flex justify-between items-center">
        <span>LINE風チャット - {name}さんのトーク画面</span>
        <button
          className="bg-white text-green-500 px-3 py-1 rounded hover:bg-green-600 hover:text-white"
          onClick={() => setName("")}
        >
          名前を変更する
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.name === name ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`p-3 rounded-lg ${
                msg.name === name
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-black"
              } max-w-xs`}
            >
              <span className="block text-sm font-semibold mb-1">
                {msg.name}
              </span>
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white flex items-center gap-2 border-t">
        <input
          className="flex-1 p-2 border rounded"
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="メッセージを入力"
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-green-600"
          onClick={handleSend}
        >
          送信
        </button>
      </div>
    </div>
  );
}

export default App;
