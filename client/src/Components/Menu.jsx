import React, { useState } from "react";
import { Files, Link, Play, Settings, LayoutGrid, Camera } from 'lucide-react';
import RunCode from "./Run_Code/RunCode";

const menuItems = [
  {
    icon: Files,
    label: "Files",
    content: (
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center space-x-2 p-2 bg-[#2d2d2d] rounded">
            <span className="text-yellow-500">JS</span>
            <span className="text-white">index.js</span>
          </div>
        </div>
        <div className="space-y-2">
          <button className="w-full text-left p-2 text-white hover:bg-[#2d2d2d] rounded">
            New File
          </button>
          <button className="w-full text-left p-2 text-white hover:bg-[#2d2d2d] rounded">
            Open File
          </button>
          <button className="w-full text-left p-2 text-white hover:bg-[#2d2d2d] rounded">
            Download File
          </button>
          <button className="w-full text-left p-2 text-white hover:bg-[#2d2d2d] rounded">
            Download All Files
          </button>
        </div>
      </div>
    ),
  },
  {
    icon: Play,
    label: "Run Code",
    content: null, // We'll render this separately
  },
  { 
    icon: Link, 
    label: "Connections",
    content: (
      <div className="p-4">
        <h2 className="text-white text-lg mb-4">Connections</h2>
        <div className="text-gray-300">Configure your connections here</div>
      </div>
    )
  },
  { 
    icon: Settings, 
    label: "Settings",
    content: (
      <div className="p-4">
        <h2 className="text-white text-lg mb-4">Settings</h2>
        <div className="text-gray-300">Adjust your settings here</div>
      </div>
    )
  },
  { 
    icon: LayoutGrid, 
    label: "Canvas",
    content: (
      <div className="p-4">
        <h2 className="text-white text-lg mb-4">Canvas</h2>
        <div className="text-gray-300">Canvas options will appear here</div>
      </div>
    )
  },
  { 
    icon: Camera, 
    label: "Camera",
    content: (
      <div className="p-4">
        <h2 className="text-white text-lg mb-4">Camera</h2>
        <div className="text-gray-300">Camera controls will appear here</div>
      </div>
    )
  }
];

export function Menu({ handleCompile, customInput, setCustomInput, outputDetails, processing }) {
  // console.log("in menu"+atob(outputDetails.stdout));
  
  const [activePanel, setActivePanel] = useState(null);

  const handleMenuClick = (item) => {
    setActivePanel(activePanel === item.label ? null : item.label);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-16 bg-[#1e1e1e] border-r border-gray-800">
        <nav className="flex flex-col py-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item)}
              className={`p-3 hover:bg-[#2d2d2d] transition-colors ${
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
        <div className="w-64 bg-slate-800 border-r border-gray-800 animate-slide-in">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <span className="text-white font-medium">
              {menuItems.find((item) => item.label === activePanel)?.label}
            </span>
            <button
              onClick={() => setActivePanel(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          {activePanel === "Run Code" ? (
            <RunCode 
              handleCompile={handleCompile}
              customInput={customInput}
              setCustomInput={setCustomInput}
              outputDetails={outputDetails}
              processing={processing}
            />
          ) : (
            menuItems.find((item) => item.label === activePanel)?.content
          )}
        </div>
      )}
    </div>
  );
}

