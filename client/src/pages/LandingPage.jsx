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
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 md:p-6">
      {/* Image at the top on mobile, right on desktop */}
      <img 
        src="home-img.svg" 
        alt="code" 
        className="w-full max-w-xs mb-8 md:mb-0 md:max-w-md md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-lg shadow-lg transform transition duration-500 hover:scale-105 order-first md:order-none md:ml-6" 
      />
      
      {/* Form container - below image on mobile, right on desktop */}
      <div className="p-6 md:p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-md transform transition duration-500 hover:scale-105 order-last md:order-none">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-white">
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
              className="w-full bg-green-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
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
    </div>
  );
};

export default LandingPage;