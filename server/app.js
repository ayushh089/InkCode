const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: ["https://ink-code-frontend.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
const cors = require("cors");

app.use(
  cors({
    origin: ["https://ink-code-frontend.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.json("Server is running");
});
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: new Map(), files: new Map() });
    }
    rooms.get(roomId).users.set(socket.id, username);
    console.log(`User ${username} joined room ${roomId}`);

    const roomFiles = Array.from(rooms.get(roomId).files.entries());
    socket.emit("initFiles", roomFiles);

    io.to(roomId).emit(
      "updateConnectedUsers",
      Array.from(rooms.get(roomId).users.values())
    );
    socket.to(roomId).emit("ToastJoined", username);
  });

  socket.on("codeChange", ({ roomId, fileName, code }) => {
    console.log(`Received code change for file ${fileName} in room ${roomId}`);
    if (rooms.has(roomId)) {
      rooms.get(roomId).files.set(fileName, code);
      socket.to(roomId).emit("codeChange", { fileName, code });
    }
  });

  socket.on("leaveRoom", ({ roomId, username }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).users.delete(socket.id);
      if (rooms.get(roomId).users.size === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit(
          "updateConnectedUsers",
          Array.from(rooms.get(roomId).users.values())
        );
        io.to(roomId).emit("userLeft", username);
      }
    }
    socket.leave(roomId);
    console.log(`User ${username} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        const username = room.users.get(socket.id);
        room.users.delete(socket.id);
        if (room.users.size === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit(
            "updateConnectedUsers",
            Array.from(room.users.values())
          );
          io.to(roomId).emit("userLeft", username);
        }
        console.log(`User ${username} disconnected from room ${roomId}`);
      }
    }
  });

  socket.on("sendMessage", ({ msg, roomId, username }) => {
    console.log("Message received:", msg, roomId, username);
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    socket.to(roomId).emit("receiveMessage", { msg, username, time });
  });

  socket.on("requestFiles", ({ roomId }) => {
    if (rooms.has(roomId)) {
      const roomFiles = Array.from(rooms.get(roomId).files.entries());
      socket.emit("initFiles", roomFiles);
    }
  });

  socket.on("fileCreated", ({ roomId, fileName, content }) => {
    console.log(`Received create request: ${fileName}`);
    if (rooms.has(roomId)) {
      rooms.get(roomId).files.set(fileName, content);
      socket.to(roomId).emit("newFile", { fileName, content });
    }
  });

  socket.on("deleteFile", ({ roomId, fileName }) => {
    console.log(`Received delete request: ${fileName}`);
    if (rooms.has(roomId)) {
      rooms.get(roomId).files.delete(fileName);
      socket.to(roomId).emit("fileDeleted", { fileName });
    }
  });

  socket.on("renameFile", ({ roomId, oldName, newName }) => {
    console.log(`Received rename request: ${oldName} -> ${newName}`);

    if (rooms.has(roomId)) {
      const content = rooms.get(roomId).files.get(oldName);
      rooms.get(roomId).files.delete(oldName);
      rooms.get(roomId).files.set(newName, content);
      socket.to(roomId).emit("fileRenamed", { oldName, newName });
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
