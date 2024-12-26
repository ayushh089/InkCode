const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    rooms.get(roomId).set(socket.id, username);
    console.log(`User ${username} joined room ${roomId}`);
    
    // Update connected users for the room
    io.to(roomId).emit("updateConnectedUsers", Array.from(rooms.get(roomId).values()));
  });

  socket.on("codeChange", ({ roomId, code }) => {
    console.log(`Received code change in room ${roomId}`);
    socket.to(roomId).emit("codeChange", code);
  });

  socket.on("leaveRoom", ({ roomId, username }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      } else {
        // Update connected users for the room
        io.to(roomId).emit("updateConnectedUsers", Array.from(rooms.get(roomId).values()));
      }
    }
    socket.leave(roomId);
    console.log(`User ${username} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    // Remove user from all rooms they were in
    for (const [roomId, users] of rooms.entries()) {
      if (users.has(socket.id)) {
        const username = users.get(socket.id);
        users.delete(socket.id);
        if (users.size === 0) {
          rooms.delete(roomId);
        } else {
          // Update connected users for the room
          io.to(roomId).emit("updateConnectedUsers", Array.from(users.values()));
        }
        console.log(`User ${username} disconnected from room ${roomId}`);
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

