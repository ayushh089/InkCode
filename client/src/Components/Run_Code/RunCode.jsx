import React, { useContext } from "react";
import { Play, Loader } from "lucide-react";
import InputArea from "../input/InputArea";
import OutputArea from "../output/OutputArea";
import { UserContext } from "../../pages/HomePage";
const RunCode = ({}) => {
  const {
    setCustomInput,
    customInput,
    outputDetails,
    processing,
    handleCompile,
  } = useContext(UserContext);
  return (
    <div className="p-4 bg-slate-800 ">
      <InputArea customInput={customInput} setCustomInput={setCustomInput} />
      <button
        onClick={handleCompile}
        className={`my-4 w-full ${
          processing ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
        } text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center`}
        disabled={processing}
      >
        {processing ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Running
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Run Code
          </>
        )}
      </button>
      <OutputArea outputDetails={outputDetails} />
    </div>
  );
};

export default RunCode;
