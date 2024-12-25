import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export const joinRoom = (roomId) => {
  socket.emit("joinRoom", roomId);
};

export const leaveRoom = (roomId) => {
  socket.emit("leaveRoom", roomId);
};

export const emitCodeChange = (roomId, code) => {
  socket.emit("codeChange", { roomId, code });
};

export const onCodeChange = (callback) => {
  socket.on("codeChange", callback);
};

export const onUpdateConnectedUsers = (callback) => {
  socket.on("updateConnectedUsers", callback);
};

export const offCodeChange = () => {
  socket.off("codeChange");
};

export const offUpdateConnectedUsers = () => {
  socket.off("updateConnectedUsers");
};

export default socket;

