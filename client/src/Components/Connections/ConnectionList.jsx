import React, { useContext } from "react";
import { UserContext } from "../../pages/layout";

const ConnectionList = () => {
  const { connectedUsers } = useContext(UserContext);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow- h-screen">
      <h2 className="text-white text-xl font-semibold mb-4">
        Connected Users: {connectedUsers.length}
      </h2>
      <div className="space-y-3">
        {connectedUsers.map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition duration-200"
          >
            <div className="text-white font-medium">{user}</div>
            <button
              className="text-blue-500 hover:text-blue-300 transition duration-200"
              onClick={() => alert(`Send a message to ${user}`)} // Add your desired action here
            >
              <i className="fas fa-comment-alt"></i> {/* Font Awesome Icon for message */}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionList;
