import React, { useContext, useEffect, useRef, useState, useCallback } from "react"
import { UserContext } from "../../pages/HomePage"
import { FilePlus2, FolderOpen, Download, DownloadCloud, File, Pen, Trash2, Users } from "lucide-react"
import { useParams } from "react-router-dom"
import JSZip from "jszip"  
import { saveAs } from "file-saver"  

const FileManager = () => {
  const { 
    code, 
    setCode, 
    onSelect, 
    socket,
    files,
    setFiles,
    fileContent,
    setFileContent,
    selectedFile,
    setSelectedFile
  } = useContext(UserContext);  const { roomId } = useParams()

  const [editableFileIndex, setEditableFileIndex] = useState(null)
  const [activeUsers, setActiveUsers] = useState([])
  const [lastUpdateTime, setLastUpdateTime] = useState({})
  const inputRefs = useRef([])
  const isUpdatingFromRemote = useRef(false)

  useEffect(() => {
    if (!socket) return

    socket.emit("requestFiles", { roomId })

    socket.on("initFiles", (roomFiles) => {
      const newFiles = roomFiles.map(([fileName]) => fileName)
      const newFileContent = Object.fromEntries(roomFiles)
      setFiles(newFiles.length > 0 ? newFiles : ["Untitled.js"])  
      setFileContent(newFileContent)
  
      if (newFiles.length > 0 && !selectedFile) {
        setSelectedFile(newFiles[0])
        setCode(newFileContent[newFiles[0]] || "")
        // Notify server about file selection
        socket.emit("fileSelected", { roomId, fileName: newFiles[0] })
      } else if (newFiles.length === 0 && !selectedFile) {
        setSelectedFile("Untitled.js")
        setCode("console.log('Hello World!')")
        socket.emit("fileSelected", { roomId, fileName: "Untitled.js" })
      }
    })

    socket.on("activeUsersUpdate", (users) => {
      setActiveUsers(users)
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
        if (newSelectedFile) {
          socket.emit("fileSelected", { roomId, fileName: newSelectedFile })
        }
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
        socket.emit("fileSelected", { roomId, fileName: newName })
      }
    })

    socket.on("codeChange", ({ fileName, code: newCode, userId, username }) => {
      const now = Date.now()
      
      // Update file content
      setFileContent((prevContent) => ({
        ...prevContent,
        [fileName]: newCode,
      }))
      
      // Update last update time for this file
      setLastUpdateTime(prev => ({
        ...prev,
        [fileName]: now
      }))
      
      // If this is the currently selected file, update the editor
      if (fileName === selectedFile) {
        isUpdatingFromRemote.current = true
        setCode(newCode)
        setTimeout(() => {
          isUpdatingFromRemote.current = false
        }, 100)
      }
      
      console.log(`Code updated by ${username} in ${fileName}`)
    })

    return () => {
      socket.off("initFiles")
      socket.off("activeUsersUpdate")
      socket.off("newFile")
      socket.off("fileDeleted")
      socket.off("fileRenamed")
      socket.off("codeChange")
    }
  }, [socket, roomId, selectedFile, setCode, files, fileContent])

  // Handle code changes from editor
  useEffect(() => {
    if (selectedFile && !isUpdatingFromRemote.current) {
      const now = Date.now()
      const lastUpdate = lastUpdateTime[selectedFile] || 0
      
      // Only send update if it's been more than 100ms since last remote update
      // This prevents infinite loops
      if (now - lastUpdate > 100) {
        setFileContent((prevContent) => ({
          ...prevContent,
          [selectedFile]: code,
        }))
        
        if (socket) {
          socket.emit("codeChange", { roomId, fileName: selectedFile, code })
        }
      }
    }
  }, [code, selectedFile, socket, roomId, lastUpdateTime])
const createNewFile = useCallback(() => {    
  // Find all existing numbers in file names
  const existingNumbers = files.map(file => {
    const match = file.match(/Untitled-(\d+)\.js/)
    return match ? parseInt(match[1]) : 0
  })
  
  // Find the highest number and add 1, or start with 1 if no files exist
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
  const newFileName = `Untitled-${nextNumber}.js`
  
  const newContent = ""
  setFiles((prevFiles) => [...prevFiles, newFileName])
  setFileContent((prevContent) => ({ ...prevContent, [newFileName]: newContent }))
  setSelectedFile(newFileName)
  setCode(newContent)

  if (socket) {
    socket.emit("fileCreated", { roomId, fileName: newFileName, content: newContent })
    socket.emit("fileSelected", { roomId, fileName: newFileName })
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

      if (selectedFile === oldName) {
        setSelectedFile(newName)
        socket.emit("fileSelected", { roomId, fileName: newName })
      }
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
        if (newSelectedFile && socket) {
          socket.emit("fileSelected", { roomId, fileName: newSelectedFile })
        }
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
      // Always use the latest content from fileContent state
      const latestContent = fileContent[fileName] || ""
      setCode(latestContent)
      onSelect(fileName)
      
      if (socket) {
        socket.emit("fileSelected", { roomId, fileName })
      }
    },
    [fileContent, onSelect, setCode, socket, roomId],
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

  const openFile = useCallback(() => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".js,.txt,.html";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        const newFileName = file.name;
        setFiles((prevFiles) => [...prevFiles, newFileName]);
        setFileContent((prevContent) => ({ ...prevContent, [newFileName]: content }));
        setSelectedFile(newFileName);
        setCode(content);
        
        if (socket) {
          socket.emit("fileCreated", { roomId, fileName: newFileName, content });
          socket.emit("fileSelected", { roomId, fileName: newFileName });
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }, [setCode, socket, roomId]);

  const downloadFile = () => {
    if (!selectedFile || !fileContent[selectedFile]) return; 
    
    const fileData = fileContent[selectedFile];
    const blob = new Blob([fileData], { type: 'text/plain' }); 
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile; 
    document.body.appendChild(a);
    a.click();
  
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = useCallback(() => {
    const zip = new JSZip()
    files.forEach((fileName) => {
      zip.file(fileName, fileContent[fileName] || "")
    })
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "all_files.zip")
    })
  }, [files, fileContent])

  // Get users editing each file
  const getUsersEditingFile = (fileName) => {
    return activeUsers.filter(user => user.fileName === fileName)
  }

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
          {files.filter(file => file).map((file, index) => {
            const usersEditing = getUsersEditingFile(file)
            const isBeingEdited = usersEditing.length > 0
            
            return (
              <div
                key={file}
                className={`flex items-center space-x-2 p-3 rounded-lg shadow-inner transition-colors duration-200 cursor-pointer ${
                  selectedFile === file 
                    ? "bg-slate-700 border-2 border-blue-500" 
                    : isBeingEdited 
                      ? "bg-gray-700 border-2 border-green-400" 
                      : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => handleSelectedFile(file)}
              >
                <File className="h-5 text-yellow-500" />
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  defaultValue={file}
                  className={`bg-transparent text-white border-none outline-none flex-1 cursor-pointer ${editableFileIndex === index ? "caret-white" : "caret-transparent"}`}
                  onBlur={(e) => handleRename(e, file, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRename(e, file, e.target.value)
                    }
                  }}
                  readOnly={editableFileIndex !== index}
                />
                
                {/* Show users editing this file */}
                {isBeingEdited && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400">
                      {usersEditing.length}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Pen
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(index)
                    }}
                    className="text-white h-4 w-4 hover:text-yellow-500 hover:scale-110 transition-transform"
                  />
                  <Trash2
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFile(file)
                    }}
                    className="text-white h-4 w-4 hover:text-red-500 hover:scale-110 transition-transform"
                  />
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Show active users info */}
        {activeUsers.length > 0 && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">Currently Active:</h3>
            <div className="space-y-1">
              {activeUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-blue-300">{user.username}</span>
                  <span className="text-gray-400">{user.fileName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 mt-4">
        <button onClick={openFile} className="w-full text-left p-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-300 flex items-center shadow-lg">
          <FolderOpen className="h-5 w-5 inline-block mr-2" />
          <span>Open File</span>
        </button>
        <button onClick={downloadFile} className="w-full text-left p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300 flex items-center shadow-lg">
          <Download className="h-5 w-5 inline-block mr-2" />
          <span>Download File</span>
        </button>
        <button onClick={downloadAllFiles} className="w-full text-left p-3 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-300 flex items-center shadow-lg">
          <DownloadCloud className="h-5 w-5 inline-block mr-2" />
          <span>Download All Files</span>
        </button>
      </div>
    </div>
  )
}

export default FileManager