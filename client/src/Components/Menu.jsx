import React, { useState, useContext } from "react";
import { Files, Link, Play, Settings, LayoutGrid, Camera } from "lucide-react";
import RunCode from "./Run_Code/RunCode";
import FileManager from "./FileManager/FileManager";
import { UserContext } from "../pages/layout";
export function Menu() {
  const {
    code,
    setCode,
    setCustomInput,
    customInput,
    outputDetails,
    processing,
    handleCompile,
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
      content: (
        <RunCode
          handleCompile={handleCompile}
          customInput={customInput}
          setCustomInput={setCustomInput}
          outputDetails={outputDetails}
          processing={processing}
        />
      ),
    },
    {
      icon: Link,
      label: "Connections",
      content: (
        <div className="p-4">
          <h2 className="text-white text-lg mb-4">Connections</h2>
          <div className="text-gray-300">Configure your connections here</div>
        </div>
      ),
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
      icon: LayoutGrid,
      label: "Canvas",
      content: (
        <div className="p-4">
          <h2 className="text-white text-lg mb-4">Canvas</h2>
          <div className="text-gray-300">Canvas options will appear here</div>
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
  ];
  const [activePanel, setActivePanel] = useState(null);

  const handleMenuClick = (item) => {
    setActivePanel(activePanel === item.label ? null : item.label);
  };

  return (
    <div className="flex w-full md:h-full md:max-h-full md:min-h-full md:w-auto">
      {/* Sidebar */}
      <div className="w-16 bg-slate-800 border-r border-gray-800 ">
        <nav className="flex flex-col ">
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
        <div className="w-72 bg-slate-800 border-l-2 border-r-4 border-r-slate-200 border-l-slate-600 animate-slide-in">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <span className="text-white font-medium">
              {menuItems.find((item) => item.label === activePanel)?.label}
            </span>
          </div>
          {menuItems.find((item) => item.label === activePanel)?.content}
        </div>
      )}
    </div>
  );
}
