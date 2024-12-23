import React from "react";

const InputArea = ({ customInput, setCustomInput }) => {
  return (
    <div className=" mt-2">
      <h2 className="text-lg font-semibold mb-2 text-white">Input</h2>
      <textarea
        rows="5"
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder="Custom input"
        className="focus:outline-none w-full border-2 border-black text-white resize-none bg-slate-700 z-10 rounded-md  px-4 py-2 hover:shadow transition duration-200 mt-2"
      />
    </div>
  );
};

export default InputArea;
