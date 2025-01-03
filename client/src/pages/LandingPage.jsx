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
    <div className="flex flex-row items-center justify-around  min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg w-96 transform transition duration-500 hover:scale-105 mr-10">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-white">
          Collaborative Code Editor
        </h1>
        <div className="space-y-6">
          <form onSubmit={joinRoom} className="space-y-4">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Join Room
            </button>
          </form>
          <div
            onClick={createRoom}
            className="text-blue-500 text-center cursor-pointer hover:underline transition duration-300 ease-in-out transform hover:scale-105"
          >
            Create New Room
          </div>
        </div>
      </div>
      <img src="home-img.svg" alt="code" className="w-[500px] h-[500px] ml-6  rounded-lg shadow-lg transform transition duration-500 hover:scale-105" />
    </div>
  );
};

export default LandingPage;
