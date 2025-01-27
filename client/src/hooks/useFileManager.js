import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import initialFile from "../utils/initialFile";
import ACTIONS from "../utils/actions";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useParams } from "react-router-dom";

export function useFileManager(socket, roomId,setConnectedUsers) {
  const [files, setFiles] = useState([initialFile]);
  const [currentFile, setCurrentFile] = useState(initialFile);

  // Create a new file
  const createNewFile = () => {
    let num = 1;
    let name = `Untitled ${num}.js`;
    let fileExists = files.some((file) => file.name === name);
  
    while (fileExists) {
      name = `Untitled ${++num}.js`;
      fileExists = files.some((file) => file.name === name);
    }
  
    const id = uuidv4();
    console.log(id);
    
    const file = {
      id,
      name,
      content: "",
    };
    setFiles((prev) => [...prev, file]);
  
    // File created event sent to server
    socket.emit(ACTIONS.FILE_CREATED, { file });
    return id;
  };
  

  // Rename a file
  const updateFile = (id, content) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id === id) {
          file.content = content;
        }

        socket.emit(ACTIONS.FILE_UPDATED, { file });
        return file;
      })
    );
    // File updated event sent to server
  };

  const openFile = (id) => {
    // Save current file
    if (currentFile) {
      updateFile(currentFile.id, currentFile.content);
    }
    const file = files.find((file) => file.id === id);
    setCurrentFile(file);
  };

  const renameFile = (id, newName) => {
    // Check if file with same name already exists
    const fileExists = files.some((file) => file.name === newName);

    if (fileExists) {
      return false;
    }

    setFiles((prev) =>
      prev.map((file) => {
        if (file.id === id) {
          file.name = newName;
        }
        return file;
      })
    );

    // File renamed event sent to server
    const file = { id, name: newName };
    socket.emit(ACTIONS.FILE_RENAMED, { file });

    return true;
  };

  const deleteFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    if (currentFile.id === id) {
      setCurrentFile(null);
    }
    // File deleted event sent to server
    socket.emit(ACTIONS.FILE_DELETED, { id });
  };
  const downloadCurrentFile = () => {
    const blob = new Blob([currentFile.content], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, currentFile.name);
  };

  const downloadAllFiles = () => {
    const zip = new JSZip();
    files.forEach((file) => {
      const blobFile = new Blob([file.content], {
        type: "text/plain;charset=utf-8",
      });
      zip.file(file.name, blobFile);
    });
    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, "InterviewKit.zip");
    });
  };

  const handleUserJoined = useCallback(
    ({ user }) => {
      toast.success(`${user.username} joined the room`);
      // send the code and drawing data to the server
      socket.emit(ACTIONS.SYNC_FILES, {
        files,
        currentFile,
        socketId: user.socketId,
      });


      setUsers((pre) => {
        return [...pre, user];
      });
    },
    [currentFile, files, setConnectedUsers, socket]
  );

  const handleFilesSync = useCallback(({ files, currentFile }) => {
    setFiles(files);
    setCurrentFile(currentFile);
  }, []);

  const handleFileRenamed = useCallback(({ file }) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === file.id) {
          f.name = file.name;
        }
        return f;
      })
    );
  }, []);

  const handleFileDeleted = useCallback(
    ({ id }) => {
      setFiles((prev) => prev.filter((file) => file.id !== id));
      if (currentFile.id === id) {
        setCurrentFile(null);
      }
    },
    [currentFile?.id]
  );

  const handleFileCreated = useCallback(({ file }) => {
    setFiles((prev) => [...prev, file]);
  }, []);

  const handleFileUpdated = useCallback(
    ({ file }) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === file.id) {
            f.content = file.content;
          }
          return f;
        })
      );
      if (currentFile.id === file.id) {
        setCurrentFile(file);
      }
    },
    [currentFile?.id]
  );
  useEffect(() => {
    if (socket) {
      socket.once(ACTIONS.SYNC_FILES, handleFilesSync);
      socket.on(ACTIONS.USER_JOINED, handleUserJoined);
      socket.on(ACTIONS.FILE_CREATED, handleFileCreated);
      socket.on(ACTIONS.FILE_UPDATED, handleFileUpdated);
      socket.on(ACTIONS.FILE_RENAMED, handleFileRenamed);
      socket.on(ACTIONS.FILE_DELETED, handleFileDeleted);
  
      return () => {
        socket.off(ACTIONS.USER_JOINED);
        socket.off(ACTIONS.FILE_CREATED);
        socket.off(ACTIONS.FILE_UPDATED);
        socket.off(ACTIONS.FILE_RENAMED);
        socket.off(ACTIONS.FILE_DELETED);
      };
    }
  }, [
    socket, // Make sure socket is part of the dependency array
    handleFileCreated,
    handleFileDeleted,
    handleFileRenamed,
    handleFilesSync,
    handleFileUpdated,
    handleUserJoined,
  ]);
  

  return {
    files,
    currentFile,
    setCurrentFile,
    createNewFile,
    renameFile,
    deleteFile,
    updateFile,
    openFile
  };
}
