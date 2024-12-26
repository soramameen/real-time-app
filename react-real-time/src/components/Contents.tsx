type ContentsProps = {
  messages: { name: string; text: string }[];
  name: string;
};
function Contents(props: ContentsProps) {
  const { messages, name } = props;
  return (
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
            <span className="block text-sm font-semibold mb-1">{msg.name}</span>
            <span>{msg.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Contents;
