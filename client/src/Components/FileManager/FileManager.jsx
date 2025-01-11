import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { UserContext } from "../../pages/HomePage";
import {
  FilePlus2,
  FolderOpen,
  Download,
  DownloadCloud,
  File,
  Pen,
  Trash2,
} from "lucide-react";
import { useParams } from "react-router-dom";

const FileManager = () => {
  const { code, setCode, onSelect, socket } = useContext(UserContext);
  console.log(socket, "socket");
  const { roomId } = useParams();

  const [files, setFiles] = useState(() => {
    const storedFiles = sessionStorage.getItem(
      import.meta.env.VITE_LOCAL_STORAGE_KEY_FILES
    );
    return storedFiles ? JSON.parse(storedFiles) : ["Untitled.js"];
  });

  const [fileContent, setFileContent] = useState(() => {
    const storedContent = sessionStorage.getItem(
      import.meta.env.VITE_LOCAL_STORAGE_KEY_CONTENT
    );
    return storedContent ? JSON.parse(storedContent) : { "Untitled.js": "" };
  });

  const [selectedFile, setSelectedFile] = useState("Untitled.js");
  const [editableFileIndex, setEditableFileIndex] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    sessionStorage.setItem(
      import.meta.env.VITE_LOCAL_STORAGE_KEY_FILES,
      JSON.stringify(files)
    );
    sessionStorage.setItem(
      import.meta.env.VITE_LOCAL_STORAGE_KEY_CONTENT,
      JSON.stringify(fileContent)
    );
  }, [files, fileContent, socket]);

  useEffect(() => {
    setFileContent((prevContent) => ({
      ...prevContent,
      [selectedFile]: code,
    }));
  }, [code, selectedFile]);

  useEffect(() => {
    if (!socket) {
      console.log("Socket not found");
      return;
    }
    socket.emit("fileCreated", { roomId, files, fileContent });

    socket.on(
      "newFiles",
      ({ files: newFiles, fileContent: newFileContent }) => {
        setFiles((prevFiles) => {
          const mergedFiles = [...new Set([...prevFiles, ...newFiles])];
          return mergedFiles;
        });

        setFileContent((prevContent) => ({
          ...prevContent,
          ...newFileContent,
        }));
      }
    );

    return () => {
      socket.off("newFiles");
    };
  }, [socket, files, fileContent]);

  const createNewFile = useCallback(() => {
    const newFileName = `Untitled-${files.length + 1}`;
    setFiles((prevFiles) => [...prevFiles, newFileName]);
    setFileContent((prevContent) => ({ ...prevContent, [newFileName]: "" }));
  }, [files.length]);

  const renameFile = useCallback(
    (oldName, newName) => {
      if (!newName.trim() || files.includes(newName)) return;
      setFiles((prevFiles) =>
        prevFiles.map((file) => (file === oldName ? newName : file))
      );
      setFileContent((prevContent) => {
        const updatedContent = {
          ...prevContent,
          [newName]: prevContent[oldName],
        };
        delete updatedContent[oldName];
        return updatedContent;
      });
      if (selectedFile === oldName) setSelectedFile(newName);
      setEditableFileIndex(null);
    },
    [files, selectedFile]
  );

  const deleteFile = useCallback(
    (fileName) => {
      setFiles((prevFiles) => {
        const updatedFiles = prevFiles.filter((file) => file !== fileName);
        setFileContent((prevContent) => {
          const updatedContent = { ...prevContent };
          delete updatedContent[fileName];
          return updatedContent;
        });

        if (selectedFile === fileName) {
          const newSelectedFile =
            updatedFiles.length > 0 ? updatedFiles[0] : null;
          setSelectedFile(newSelectedFile);
          if (newSelectedFile) {
            setCode((prevContent) => prevContent[newSelectedFile] || "");
          } else {
            setCode("");
          }
        }

        return updatedFiles;
      });
    },
    [selectedFile, setCode]
  );

  const handleSelectedFile = useCallback(
    (fileName) => {
      setSelectedFile(fileName);
      setCode(fileContent[fileName]);
      onSelect(fileName);
    },
    [fileContent, onSelect, setCode]
  );

  const handleEdit = useCallback((index) => {
    setEditableFileIndex(index);
    setTimeout(() => {
      inputRefs.current[index]?.focus();
    }, 0);
  }, []);

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
          {files.map((file, index) => (
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
                  editableFileIndex === index
                    ? "caret-white"
                    : "caret-transparent"
                }`}
                onBlur={(e) => renameFile(file, e.target.value)}
                readOnly={editableFileIndex !== index}
              />
              <div className="flex items-center space-x-5">
                <Pen
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(index);
                  }}
                  className="text-white h-5 w-5 ml-auto hover:text-yellow-500 hover:scale-150"
                />
                <Trash2
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file);
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
  );
};

export default FileManager;
