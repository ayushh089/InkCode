import React from "react"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"
import { dracula } from "@uiw/codemirror-theme-dracula"
import { solarizedLight, solarizedDark } from "@uiw/codemirror-theme-solarized"
import { duotoneLight, duotoneDark } from "@uiw/codemirror-theme-duotone"
import { materialDark, materialLight } from "@uiw/codemirror-theme-material"

const Editor = ({ onChange, initialCode, size, theme }) => {
  const themes = {
    light: undefined, 
    dark: oneDark,
    dracula: dracula,
    solarizedLight: solarizedLight,
    solarizedDark: solarizedDark,
    duotoneDark: duotoneDark,
    materialDark: materialDark,
    materialLight: materialLight,
  }

  const handleEditorChange = (value) => {
    onChange("code", value)
  }

  const sizeClasses = {
    "1": "text-xs",
    "2": "text-sm",
    "3": "text-base",
    "4": "text-lg",
    "5": "text-xl",
    "6": "text-2xl",
    "7": "text-3xl",
    "8": "text-4xl",
    "9": "text-5xl",
  }

  return (
    <div className="flex h-screen">
      <div className={`editor-container flex-grow ${sizeClasses[size] || "text-base"}`}>
        <CodeMirror
          value={initialCode}
          height="100vh"
          theme={themes[theme] || themes.light}
          extensions={[javascript({ jsx: true })]}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  )
}

export default Editor

