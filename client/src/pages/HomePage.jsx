import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Menu } from "../Components/Menu";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Editor from "../Components/editor/Editor";
import io from "socket.io-client";
import { languageOptions } from "../constants/languageOptions";
const UserContext = React.createContext();
const defCode = `console.log("Hello World!");`;

export function HomePage() {
  const { roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || "Anonymous";

  const [code, setCode] = useState(defCode);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [languageCode, setLanguageCode] = useState(63);
  const [size, setSize] = useState(1);
  const [theme, setTheme] = useState("dark");
  const [currentFile, setCurrentFile] = useState(null);
  const [files, setFiles] = useState(["Untitled.js"])
  const [fileContent, setFileContent] = useState({"Untitled.js":"console.log('Hello World!')"})
  const [selectedFile, setSelectedFile] = useState(null)
  const isUpdatingFromRemote = useRef(false);

  const onSelect = (file) => {
    const extension = "." + file.split(".").pop();
    const language = languageOptions.find(
      (lang) => lang.extension === extension
    );
    if (language) {
      setLanguageCode(language.id);
    }
    setCurrentFile(file);
  };

  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_APP_SOCKET_URL || "http://localhost:3000"
    );
    setSocket(newSocket);

    newSocket.on("connect", () => {
      // console.log("Connected to server");
      newSocket.emit("joinRoom", { roomId, username });
    });

    newSocket.on("disconnect", () => {
      // console.log("Disconnected from server");
    });

    newSocket.on("updateConnectedUsers", (users) => {
      setConnectedUsers(users);
    });

    newSocket.on("ToastJoined", (joinedUsername) => {
      showSuccessToast(`${joinedUsername} has joined the room!`);
    });

    newSocket.on("userLeft", (leftUsername) => {
      showErrorToast(`${leftUsername} has left the room!`);
    });

    newSocket.on("receiveMessage", ({ msg, username, time }) => {
      setMessages((prevMessages) => [...prevMessages, { msg, username, time }]);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      showErrorToast("Connection failed. Please try again.");
    });

    return () => {
      if (newSocket) {
        newSocket.emit("leaveRoom", { roomId, username });
        newSocket.disconnect();
      }
    };
  }, [roomId, username]);

  const handleCodeChange = (key, value) => {
    if (key === "code" && !isUpdatingFromRemote.current) {
      setCode(value);
    }
  };

  const sendMessage = (msg) => {
    if (socket) {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      socket.emit("sendMessage", { msg, roomId, username, time });
      setMessages((prevMessages) => [...prevMessages, { msg, username, time }]);
    }
  };

  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: languageCode, // JavaScript (Node.js 12.14.0)
      source_code: btoa(code),
      stdin: btoa(customInput),
    };

    const options = {
      method: "POST",
      url: import.meta.env.VITE_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        setProcessing(false);
        showErrorToast(error.source_code[0]);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: `${import.meta.env.VITE_RAPID_API_URL}/${token}`,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      if (statusId === 1 || statusId === 2) {
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        let status_desc = response.data?.status?.description;
        let status_id = response.data?.status?.id;
        if (status_id === 3) {
          showSuccessToast(status_desc);
        } else {
          showErrorToast(status_desc);
        }
      }
    } catch (err) {
      setProcessing(false);
      showErrorToast(err);
    }
  };

  const showSuccessToast = (msg) => {
    toast.success(msg, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const showErrorToast = (msg) => {
    toast.error(msg, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <UserContext.Provider
      value={{
        code,
        setCode,
        setCustomInput,
        customInput,
        outputDetails,
        processing,
        handleCompile,
        connectedUsers,
        onSelect,
        messages,
        sendMessage,
        username,
        socket,
        setSize,
        setTheme,
        files,
        setFiles,
        fileContent,
        setFileContent,
        selectedFile,
        setSelectedFile,
        currentFile,
        setCurrentFile,
      }}
    >
      <div className="flex h-screen bg-gray-100">
        <Menu />
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1">
              <Editor
                onChange={handleCodeChange}
                initialCode={code}
                connectedUsers={connectedUsers}
                size={size}
                theme={theme}
              />
            </main>
          </div>
          {/* <div className="w-1/3 h-full bg-gray-200 flex flex-col border-l-8 border-l-slate-800">
            <VideoCall socket={socket} roomId={roomId} username={username} />
          </div> */}
        </div>
        <ToastContainer />
      </div>
    </UserContext.Provider>
  );
}

export { UserContext };
