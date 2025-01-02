import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { Menu } from "../Components/Menu";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Editor from "../Components/editor/Editor";
import io from "socket.io-client";
import VideoCall from "../Components/VideoCall/VideoCall";

const UserContext = createContext();
const defCode = `console.log("Hello World!");`;

export function HomePage() {
  const { roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || "Anjan";

  const [code, setCode] = useState(defCode);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]); //msgs ki list
  const [socketId]
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000");

    socketRef.current.emit("joinRoom", { roomId, username });

    socketRef.current.on("updateConnectedUsers", (users) => {
      setConnectedUsers(users);
    });

    socketRef.current.on("ToastJoined", (joinedUsername) => {
      showSuccessToast(`${joinedUsername} has joined the room!`);
    });

    socketRef.current.on("userLeft", (joinedUsername) => {
      showErrorToast(`${joinedUsername} has left the room!`);
    });

    socketRef.current.on("codeChange", (updatedCode) => {
      if (updatedCode !== code) {
        setCode(updatedCode);
      }
    });
    socketRef.current.on("receiveMessage", ({ msg, username, time }) => {
      setMessages((prevMessages) => [...prevMessages, { msg, username, time }]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveRoom", { roomId, username });
        socketRef.current.disconnect();
      }
    };
  }, []); //ek he baar chlega

  const handleCodeChange = (key, value) => {
    if (key === "code") {
      setCode(value);
      socketRef.current.emit("codeChange", { roomId, code: value });
    }
  };
  const sendMessage = (msg) => {
    if (socketRef.current) {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      socketRef.current.emit("sendMessage", { msg, roomId, username, time });
      setMessages((prevMessages) => [...prevMessages, { msg, username, time }]);
    }
  };

  const handleCompile = () => {
    console.log("handleCompile");

    setProcessing(true);
    const formData = {
      language_id: 63, // JavaScript (Node.js 12.14.0)
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
        console.log("catch block...", error);
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
        console.log("response.data", response.data);
        let status_desc = response.data?.status?.description;
        let status_id = response.data?.status?.id;
        if (status_id === 3) {
          showSuccessToast(status_desc);
        } else {
          showErrorToast(status_desc);
        }
      }
    } catch (err) {
      console.log("err", err);
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
        socket: socketRef.current,
        messages,
        sendMessage,
        username,
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
              />
            </main>
          </div>
          <div className="w-1/3 h-full bg-gray-200 flex flex-col items-center justify-center border-l-8 border-l-slate-800">
           <VideoCall socket={socketRef.current} />
          </div>
        </div>
        <ToastContainer />
      </div>
    </UserContext.Provider>
  );
}

export { UserContext };