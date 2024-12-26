type HeaderProps = {
  setName: (name: string) => void; // 名前をセットする関数
  name: string; // 現在の入力値
};
function Header(props: HeaderProps) {
  const { setName, name } = props;
  return (
    <div className="bg-green-500 text-white p-4 text-lg font-semibold flex justify-between items-center">
      <span>LINE風チャット - {name}さんのトーク画面</span>
      <button
        className="bg-white text-green-500 px-3 py-1 rounded hover:bg-green-600 hover:text-white"
        onClick={() => setName("")}
      >
        名前を変更する
      </button>
    </div>
  );
}

export default Header;
