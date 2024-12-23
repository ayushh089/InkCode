import React from "react";

const OutputArea = ({ outputDetails }) => {
  // console.log("OutputArea" + output);
  const getOutput = () => {
    console.log("AAAA");

    let statusId = outputDetails?.status?.id;

    if (statusId === 6) {
      // compilation error
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {atob(outputDetails?.compile_output)}
        </pre>
      );
    } else if (statusId === 3) {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-green-500">
          {atob(outputDetails.stdout) !== null
            ? `${"hey" + atob(outputDetails.stdout)}`
            : null}
        </pre>
      );
    } else if (statusId === 5) {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {`Time Limit Exceeded`}
        </pre>
      );
    } else {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {atob(outputDetails?.stderr)}
        </pre>
      );
    }
  };

  return (
    <div className="output-area mt-2">
      <h2 className="text-lg font-semibold mb-2 text-white">Output</h2>
      <textarea
        value={outputDetails ? getOutput() : null}
        readOnly
        rows="10"
        res
        placeholder="Output ..."
        className="w-full border-2 border-black bg-slate-700 text-white rounded-md resize-none  px-4 py-2 focus:outline-none"
      />
    </div>
  );
};

export default OutputArea;
