type LoginProps = {
  setName: (name: string) => void; // 名前をセットする関数
  nameInput: string; // 現在の入力値
  setNameInput: (input: string) => void; // 入力値をセットする関数
};
function Login(props: LoginProps) {
  const { setName, nameInput, setNameInput } = props;
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

export default Login;
