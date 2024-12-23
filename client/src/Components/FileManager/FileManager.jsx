import React,{useContext} from "react";
import { UserContext } from "../../pages/layout";
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
  return (
    <div className="p-4 ">
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
  );
};

export default FileManager;
