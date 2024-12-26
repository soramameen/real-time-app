type PostComponentProps = {
  inputMsg: string;
  setInputMsg: (value: string) => void;
  handleSend: () => void;
};

function PostComponent(props: PostComponentProps) {
  const { inputMsg, setInputMsg, handleSend } = props;
  return (
    <div>
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

export default PostComponent;
