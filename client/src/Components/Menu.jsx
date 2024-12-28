import React, { useState, useContext } from "react";
import {
  Files,
  Play,
  Settings,
  Camera,
  Users,
  MessageCircleMore,
} from "lucide-react";
import RunCode from "./Run_Code/RunCode";
import FileManager from "./FileManager/FileManager";
import { UserContext } from "../pages/HomePage";
import ConnectionList from "./Connections/ConnectionList";
import Chat from "./Chat/Chat";

export function Menu() {
  const {
    code,
    setCode,
    setCustomInput,
    customInput,
    outputDetails,
    processing,
    handleCompile,
    connectedUsers,
    socket,
    messages,
    sendMessage,
    username,
  } = useContext(UserContext);

  const menuItems = [
    {
      icon: Files,
      label: "Files",
      content: <FileManager />,
    },
    {
      icon: Play,
      label: "Run Code",
      content: <RunCode />,
    },
    {
      icon: Users,
      label: "Connections",
      content: <ConnectionList />,
    },
    {
      icon: Settings,
      label: "Settings",
      content: (
        <div className="p-4">
          <h2 className="text-white text-lg mb-4">Settings</h2>
          <div className="text-gray-300">Adjust your settings here</div>
        </div>
      ),
    },
    {
      icon: Camera,
      label: "Camera",
      content: (
        <div className="p-4">
          <h2 className="text-white text-lg mb-4">Camera</h2>
          <div className="text-gray-300">Camera controls will appear here</div>
        </div>
      ),
    },
    {
      icon: MessageCircleMore,
      label: "Chat",
      content: (
        <Chat
          messages={messages}
          sendMessage={sendMessage}
          username={username}
        />
      ),
    },
  ];

  const [activePanel, setActivePanel] = useState(null);

  const handleMenuClick = (item) => {
    setActivePanel(activePanel === item.label ? null : item.label);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-16 bg-slate-800 border-r border-gray-800 h-full">
        <nav className="flex flex-col h-full">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item)}
              className={`p-3 hover:bg-slate-600 transition-colors ${
                activePanel === item.label ? "bg-[#2d2d2d]" : ""
              }`}
              title={item.label}
            >
              <item.icon className="h-6 w-6 text-gray-400" />
            </button>
          ))}
        </nav>
      </div>

      {/* Panel */}
      {activePanel && (
        <div className="w-80 bg-slate-800 border-l-2 border-r-4 border-r-slate-200 border-l-slate-600 animate-slide-in h-full flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <span className="text-white font-medium">
              {menuItems.find((item) => item.label === activePanel)?.label}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {menuItems.find((item) => item.label === activePanel)?.content}
          </div>
        </div>
      )}
    </div>
  );
}
