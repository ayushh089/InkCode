import React, { useContext, useEffect, useRef, useState, useCallback } from "react"
import { UserContext } from "../../pages/HomePage"
import { FilePlus2, FolderOpen, Download, DownloadCloud, File, Pen, Trash2 } from "lucide-react"
import { useParams } from "react-router-dom"

const FileManager = () => {
  const { code, setCode, onSelect, socket } = useContext(UserContext)
  const { roomId } = useParams()

  const [files, setFiles] = useState([])
  const [fileContent, setFileContent] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [editableFileIndex, setEditableFileIndex] = useState(null)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!socket) return

    socket.emit("requestFiles", { roomId })

    socket.on("initFiles", (roomFiles) => {
      const newFiles = roomFiles.map(([fileName]) => fileName)
      const newFileContent = Object.fromEntries(roomFiles)
      setFiles(newFiles)
      setFileContent(newFileContent)
      if (newFiles.length > 0 && !selectedFile) {
        setSelectedFile(newFiles[0])
        setCode(newFileContent[newFiles[0]] || "")
      }
    })

    socket.on("newFile", ({ fileName, content }) => {
      setFiles((prevFiles) => [...prevFiles, fileName])
      setFileContent((prevContent) => ({ ...prevContent, [fileName]: content }))
    })

    socket.on("fileDeleted", ({ fileName }) => {
      setFiles((prevFiles) => prevFiles.filter((file) => file !== fileName))
      setFileContent((prevContent) => {
        const newContent = { ...prevContent }
        delete newContent[fileName]
        return newContent
      })
      if (selectedFile === fileName) {
        const newSelectedFile = files.find((file) => file !== fileName) || null
        setSelectedFile(newSelectedFile)
        setCode(newSelectedFile ? fileContent[newSelectedFile] : "")
      }
    })

    socket.on("fileRenamed", ({ oldName, newName }) => {
      setFiles((prevFiles) => prevFiles.map((file) => (file === oldName ? newName : file)))
      setFileContent((prevContent) => {
        const newContent = { ...prevContent }
        newContent[newName] = newContent[oldName]
        delete newContent[oldName]
        return newContent
      })
      if (selectedFile === oldName) {
        setSelectedFile(newName)
      }
    })

    socket.on("codeChange", ({ fileName, code }) => {
      setFileContent((prevContent) => ({
        ...prevContent,
        [fileName]: code,
      }))
      if (fileName === selectedFile) {
        setCode(code)
      }
    })

    return () => {
      socket.off("initFiles")
      socket.off("newFile")
      socket.off("fileDeleted")
      socket.off("fileRenamed")
      socket.off("codeChange")
    }
  }, [socket, roomId, selectedFile, setCode, files, fileContent])

  useEffect(() => {
    if (selectedFile) {
      setFileContent((prevContent) => ({
        ...prevContent,
        [selectedFile]: code,
      }))
      if (socket) {
        socket.emit("codeChange", { roomId, fileName: selectedFile, code })
      }
    }
  }, [code, selectedFile, socket, roomId])

  const createNewFile = useCallback(() => {
    const newFileName = `Untitled-${files.length + 1}.js`
    const newContent = ""
    setFiles((prevFiles) => [...prevFiles, newFileName])
    setFileContent((prevContent) => ({ ...prevContent, [newFileName]: newContent }))
    setSelectedFile(newFileName)
    setCode(newContent)

    if (socket) {
      socket.emit("fileCreated", { roomId, fileName: newFileName, content: newContent })
    }
  }, [files, socket, roomId, setCode])

  const renameFile = useCallback(
    (oldName, newName) => {
      if (!newName.trim() || files.includes(newName) || oldName === newName) return

      setFiles((prevFiles) => prevFiles.map((file) => (file === oldName ? newName : file)))
      setFileContent((prevContent) => {
        const updatedContent = {
          ...prevContent,
          [newName]: prevContent[oldName],
        }
        delete updatedContent[oldName]
        return updatedContent
      })

      if (selectedFile === oldName) setSelectedFile(newName)
      setEditableFileIndex(null)

      if (socket) {
        socket.emit("renameFile", { roomId, oldName, newName })
      }
    },
    [files, selectedFile, socket, roomId],
  )

  const deleteFile = useCallback(
    (fileName) => {
      setFiles((prevFiles) => prevFiles.filter((file) => file !== fileName))
      setFileContent((prevContent) => {
        const updatedContent = { ...prevContent }
        delete updatedContent[fileName]
        return updatedContent
      })

      if (selectedFile === fileName) {
        const newSelectedFile = files.find((file) => file !== fileName) || null
        setSelectedFile(newSelectedFile)
        setCode(newSelectedFile ? fileContent[newSelectedFile] : "")
      }

      if (socket) {
        socket.emit("deleteFile", { roomId, fileName })
      }
    },
    [selectedFile, setCode, fileContent, socket, roomId, files],
  )

  const handleSelectedFile = useCallback(
    (fileName) => {
      setSelectedFile(fileName)
      setCode(fileContent[fileName] || "")
      onSelect(fileName)
    },
    [fileContent, onSelect, setCode],
  )

  const handleEdit = useCallback((index) => {
    setEditableFileIndex(index)
    setTimeout(() => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].focus()
        inputRefs.current[index].select()
      }
    }, 0)
  }, [])

  const handleRename = useCallback(
    (e, oldName, newName) => {
      if (e.key === "Enter" || e.type === "blur") {
        e.preventDefault()
        renameFile(oldName, newName)
      }
    },
    [renameFile],
  )

  return (
    <div className="p-6 h-full bg-slate-800 flex flex-col">
      <button
        onClick={createNewFile}
        className="w-full text-left p-4 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-300 shadow-lg"
      >
        <div className="flex items-center">
          <FilePlus2 className="h-5 w-5 inline-block mr-2" />
          <span className="font-bold">New File</span>
        </div>
      </button>

      <div className="mt-6 mb-4 flex-grow overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-3">Files</h2>
        <div className="space-y-2">
          {files.filter(file => file).map((file, index) => (
            <div
              key={file}
              className={`flex items-center space-x-2 p-3 bg-gray-800 rounded-lg shadow-inner ${
                selectedFile === file ? "bg-slate-700" : "hover:bg-gray-700"
              } transition-colors duration-200 cursor-pointer`}
              onClick={() => handleSelectedFile(file)}
            >
              <File className="h-5 text-yellow-500" />
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                defaultValue={file}
                className={`bg-transparent text-white border-none outline-none w-full cursor-pointer ${
                  editableFileIndex === index ? "caret-white" : "caret-transparent"
                }`}
                onBlur={(e) => handleRename(e, file, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRename(e, file, e.target.value)
                  }
                }}
                readOnly={editableFileIndex !== index}
              />
              <div className="flex items-center space-x-5">
                <Pen
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(index)
                  }}
                  className="text-white h-5 w-5 ml-auto hover:text-yellow-500 hover:scale-150"
                />
                <Trash2
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFile(file)
                  }}
                  className="text-white h-5 w-5 ml-auto hover:text-yellow-500 hover:scale-150"
                />
              </div>
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
  )
}

export default FileManager

