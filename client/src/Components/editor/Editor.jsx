import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

const Editor = ({ onChange, initialCode }) => {

  
  const handleEditorChange = (value) => {
    onChange("code", value);
  };

  return (
    <div className="flex h-screen">
      <div className="editor-container text-lg flex-grow">
        <CodeMirror
          value={initialCode}
          height="100vh"
          theme={oneDark}
          extensions={[javascript({ jsx: true })]}
          onChange={handleEditorChange}
        />
      </div>
      
    </div>
  );
};

export default Editor;

