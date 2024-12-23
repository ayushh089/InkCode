import React from "react";

const OutputArea = ({ outputDetails }) => {
  const getOutput = () => {
    let statusId = outputDetails?.status?.id;

    if (statusId === 6) {
      // Compilation error
      return atob(outputDetails?.compile_output);
    } else if (statusId === 3) {
      // Successful execution
      return atob(outputDetails?.stdout) || "";
    } else if (statusId === 5) {
      // Time limit exceeded
      return "Time Limit Exceeded";
    } else {
      // Runtime error
      return atob(outputDetails?.stderr);
    }
  };

  return (
    <div className="output-area mt-2">
      <h2 className="text-lg font-semibold mb-2 text-white">Output</h2>
      <textarea
        value={outputDetails ? getOutput() : ""}
        readOnly
        rows="10"
        placeholder="Output ..."
        className="w-full border-2 border-black bg-slate-700 text-white rounded-md resize-none px-4 py-2 focus:outline-none"
      />
    </div>
  );
};

export default OutputArea;
