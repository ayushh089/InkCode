import React, { useState,useContext } from "react";
import { Send } from "lucide-react";
import { UserContext } from "../../pages/HomePage";

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const { messages, sendMessage, username}= useContext(UserContext);
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded-xl ${
              message.username === username
                ? "bg-blue-600 ml-auto"
                : "bg-gray-900"
            } text-white max-w-[70%]`}
          >
            <p className="text-sm font-bold">
              {message.username === username ? "" : message.username}
            </p>

            <p className="break-words text-sm">{message.msg}</p>
            <p className="text-xs text-gray-400 text-right">{message.time}</p>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          className="w-full h-12 bg-slate-800 text-white p-2 border-4 border-blue-700 rounded-l-xl resize-none"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-xl flex items-center justify-center transition-colors over"
        >
          <Send />
        </button>
      </div>
    </div>
  );
};

export default Chat;
