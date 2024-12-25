import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      navigate(`/editor/${roomId}`, { state: { username } });
    } else {
      alert("Please enter both a room ID and a username");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Collaborative Code Editor
        </h1>
        <div className="space-y-4">
          <form onSubmit={joinRoom} className="space-y-2">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
            >
              Join Room
            </button>
          </form>
          <div
            onClick={createRoom}
            className="  text-blue-500 text-center cursor-pointer hover:underline"
          >
            Create New Room
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;