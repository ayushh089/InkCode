import React, { useState, useEffect } from "react";
import socketio from "socket.io-client";

export const SocketContext = React.createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to socket server when the component mounts
    const newSocket = socketio.connect("http://localhost:3000");
    setSocket(newSocket);

    // Cleanup: disconnect socket when component unmounts
    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
