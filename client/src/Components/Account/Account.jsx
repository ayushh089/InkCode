import React, { useContext, useState } from "react";
import { UserContext } from "../../pages/HomePage";
import { useParams } from "react-router-dom";
import { Copy } from "lucide-react";

const Account = () => {
  const { roomId } = useParams();
  const { username } = useContext(UserContext);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="p-4 bg-slate-800 rounded-md shadow-md max-w-md mx-auto h-full">
      <h2 className="text-white text-xl font-semibold mb-4">
        Hello, {username}
      </h2>
      <p className="text-gray-300 mb-6">
        Share the code below with your friends to join the room.
      </p>
      <div className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
        <span className="text-white font-mono">{roomId}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-500"
        >
          <Copy className="w-5 h-5" />
          {copySuccess ? "Copied!" : "Copy"}
        </button>
      </div>
      {copySuccess && (
        <div className="text-green-500 text-sm mt-2">
          Code copied to clipboard!
        </div>
      )}
      <div className="fixed bottom-0  flex items-center justify-center">
        <button
          className="bg-red-500 text-white font-bold mb-5 p-3 rounded-md"
          onClick={() => (window.location.href = "/")}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default Account;
