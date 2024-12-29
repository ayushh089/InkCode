import React, { useContext } from "react";
import { UserContext } from "../../pages/HomePage";

const ConnectionList = ({id}) => {
  const { connectedUsers } = useContext(UserContext);


  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow- h-full">
      <h2 className="text-white text-xl font-semibold mb-4">
        Connected Users: {connectedUsers.length}
      </h2>
      <div className="space-y-3">
        {connectedUsers.map((user, index) => (
          <div
            key={index}
            className="flex items-center  p-3 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition duration-200"
          >
            <div className="mr-3 ">
              <img
                src={`https://ui-avatars.com/api/?name=${user}&background=random&length=1&unique=${id}`}
                alt="Ayush Gupta Avatar"
                className="rounded-full w-8 h-8"
              />
            </div>
            <div className="text-white font-medium">{user}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionList;

// Avatars generated using UI Avatars: https://ui-avatars.com/
//Thanks for this free API
