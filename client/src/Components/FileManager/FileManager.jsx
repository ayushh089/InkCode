import React, { useContext, useState } from "react";
import { UserContext } from "../../pages/HomePage";
import {
  FilePlus2,
  FolderOpen,
  Download,
  DownloadCloud,
  File,
} from "lucide-react";

const FileManager = () => {
  const {
    code,
    setCode,
    setCustomInput,
    customInput,
    outputDetails,
    processing,
    handleCompile,
  } = useContext(UserContext);

  // Simulating a large number of files for demonstration
  const [files, setFiles] = useState(
    Array(20)
      .fill()
      .map((_, i) => `file${i + 1}.js`)
  );

  return (
    <div className=" p-6 h-full bg-gray-900 flex flex-col">
      <button className="w-full text-left p-4 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-300 shadow-lg">
        <div className="flex items-center">
          <FilePlus2 className="h-5 w-5 inline-block mr-2" />
          <span className="font-bold">New File</span>
        </div>
      </button>
      <div className="mt-6 mb-4 flex-grow overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-3">Files</h2>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg shadow-inner hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            >
              <File className="h-5 w-5 text-yellow-500" />
              <span className="text-white">{file}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 mt-4">
        <button className="w-full text-left p-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-300 flex items-center shadow-lg">
          <FolderOpen className="h-5 w-5 inline-block mr-2" />
          <span>Open File</span>
        </button>
        <button className="w-full text-left p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300 flex items-center shadow-lg">
          <Download className="h-5 w-5 inline-block mr-2" />
          <span>Download File</span>
        </button>
        <button className="w-full text-left p-3 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-300 flex items-center shadow-lg">
          <DownloadCloud className="h-5 w-5 inline-block mr-2" />
          <span>Download All Files</span>
        </button>
      </div>
    </div>
  );
};

export default FileManager;
