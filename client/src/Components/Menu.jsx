import React, { useState, useContext, useId } from "react";
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
import Account from "./Account/Account";
import Setting from "./Settings/Setting";
import VideoCall from "./VideoCall/VideoCall";

export function Menu() {
  const [userId, setUserId] = useState(useId());
  const { username } = useContext(UserContext);

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
      content: <ConnectionList id={userId} />,
    },
    {
      icon: Settings,
      label: "Settings",
      content: <Setting />,
    },
    {
      icon: Camera,
      label: "Video",
      content:<VideoCall />,
    },
    {
      icon: MessageCircleMore,
      label: "Chat",
      content: <Chat />,
    },
  ];

  const [activePanel, setActivePanel] = useState(null);

  const handleMenuClick = (item) => {
    setActivePanel(activePanel === item.label ? null : item.label);
  };

  const handleAvatarClick = () => {
    setActivePanel(activePanel === "Account" ? null : "Account");
  };

  const accountPanelContent = <Account />;

  return (
    <div className="flex h-screen">
          <div className={`w-80 bg-slate-800 h-full flex flex-col ${
      activePanel === "Files" ? "hidden" : "hidden"
    }`}>
      <FileManager />
    </div>
  
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
          <div className="text-white fixed bottom-0 mb-5 p-3 cursor-pointer">
            <img
              src={`https://ui-avatars.com/api/?name=${username}&background=random&length=1&unique=${userId}`}
              alt="Avatar"
              className="account rounded-full w-8 h-8"
              title="Account"
              onClick={handleAvatarClick}
            />
          </div>
        </nav>
      </div>

      {activePanel && activePanel !== "Account" && (
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

      {activePanel === "Account" && (
        <div className="w-80 bg-slate-800 border-l-2 border-r-4 border-r-slate-200 border-l-slate-600 animate-slide-in h-full flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <span className="text-white font-medium">Account</span>
          </div>
          <div className="flex-1 overflow-y-auto">{accountPanelContent}</div>
        </div>
      )}
    </div>
  );
}
