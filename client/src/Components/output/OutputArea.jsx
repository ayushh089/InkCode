import React from "react";

const OutputArea = ({ output }) => {
  console.log("OutputArea"+output);
  
  return (
    <div className="output-area mt-2">
      <h2 className="text-lg font-semibold mb-2">Output</h2>
      <textarea
        value={output || "Output . . ."}
        readOnly
        rows="10"
        placeholder="Output ..."
        className="w-full border-2 border-black bg-black text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 focus:outline-none"
      />
    </div>
  );
};

export default OutputArea;
