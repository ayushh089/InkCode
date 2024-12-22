import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

const Editor = ({ onChange, code }) => {
  const handleEditorChange = (value) => {
    onChange("code", value);
  };

  return (
    <div className="editor-container text-lg h-full">
      <CodeMirror
        value={code}
        height="100vh"
        theme={oneDark}
        extensions={[javascript({ jsx: true })]}
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default Editor;

