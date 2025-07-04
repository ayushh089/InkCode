const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { 
        users: new Map(), 
        files: new Map(),
        activeUsers: new Map()
      });
    }
    
    const room = rooms.get(roomId);
    room.users.set(socket.id, username);
    console.log(`User ${username} joined room ${roomId}`);

    const roomFiles = Array.from(room.files.entries());
    socket.emit("initFiles", roomFiles);

    const activeUsersInfo = Array.from(room.activeUsers.entries()).map(([userId, data]) => ({
      userId,
      username: room.users.get(userId),
      fileName: data.fileName,
      lastActivity: data.lastActivity
    }));
    socket.emit("activeUsersUpdate", activeUsersInfo);

    io.to(roomId).emit(
      "updateConnectedUsers",
      Array.from(room.users.values())
    );
    socket.to(roomId).emit("ToastJoined", username);
  });

  socket.on("fileSelected", ({ roomId, fileName }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.activeUsers.set(socket.id, {
        fileName,
        lastActivity: Date.now()
      });
      
      const activeUsersInfo = Array.from(room.activeUsers.entries()).map(([userId, data]) => ({
        userId,
        username: room.users.get(userId),
        fileName: data.fileName,
        lastActivity: data.lastActivity
      }));
      io.to(roomId).emit("activeUsersUpdate", activeUsersInfo);
    }
  });

  socket.on("codeChange", ({ roomId, fileName, code, cursorPosition }) => {
    console.log(`Received code change for file ${fileName} in room ${roomId}`);
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      
      room.files.set(fileName, code);
      
      if (room.activeUsers.has(socket.id)) {
        room.activeUsers.get(socket.id).lastActivity = Date.now();
      }
      
      socket.to(roomId).emit("codeChange", { 
        fileName, 
        code, 
        cursorPosition,
        userId: socket.id,
        username: room.users.get(socket.id)
      });
    }
  });

  socket.on("cursorMove", ({ roomId, fileName, cursorPosition }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      socket.to(roomId).emit("cursorMove", {
        fileName,
        cursorPosition,
        userId: socket.id,
        username: room.users.get(socket.id)
      });
    }
  });

  socket.on("leaveRoom", ({ roomId, username }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.users.delete(socket.id);
      room.activeUsers.delete(socket.id);
      
      if (room.users.size === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit(
          "updateConnectedUsers",
          Array.from(room.users.values())
        );
        
        const activeUsersInfo = Array.from(room.activeUsers.entries()).map(([userId, data]) => ({
          userId,
          username: room.users.get(userId),
          fileName: data.fileName,
          lastActivity: data.lastActivity
        }));
        io.to(roomId).emit("activeUsersUpdate", activeUsersInfo);
        
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
        room.activeUsers.delete(socket.id);
        
        if (room.users.size === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit(
            "updateConnectedUsers",
            Array.from(room.users.values())
          );
          
          const activeUsersInfo = Array.from(room.activeUsers.entries()).map(([userId, data]) => ({
            userId,
            username: room.users.get(userId),
            fileName: data.fileName,
            lastActivity: data.lastActivity
          }));
          io.to(roomId).emit("activeUsersUpdate", activeUsersInfo);
          
          io.to(roomId).emit("userLeft", username);
        }
        console.log(`User ${username} disconnected from room ${roomId}`);
      }
    }
  });

  socket.on("sendMessage", ({ msg, roomId, username }) => {
    console.log("Message received:", msg, roomId, username);
    const time = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
    socket.to(roomId).emit("receiveMessage", { msg, username, time });
  });

  socket.on("requestFiles", ({ roomId }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      const roomFiles = Array.from(room.files.entries());
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
      const room = rooms.get(roomId);
      room.files.delete(fileName);
      
      for (const [userId, data] of room.activeUsers.entries()) {
        if (data.fileName === fileName) {
          room.activeUsers.delete(userId);
        }
      }
      
      socket.to(roomId).emit("fileDeleted", { fileName });
      
      const activeUsersInfo = Array.from(room.activeUsers.entries()).map(([userId, data]) => ({
        userId,
        username: room.users.get(userId),
        fileName: data.fileName,
        lastActivity: data.lastActivity
      }));
      io.to(roomId).emit("activeUsersUpdate", activeUsersInfo);
    }
  });

  socket.on("renameFile", ({ roomId, oldName, newName }) => {
    console.log(`Received rename request: ${oldName} -> ${newName}`);
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      const content = room.files.get(oldName);
      room.files.delete(oldName);
      room.files.set(newName, content);
      
      for (const [userId, data] of room.activeUsers.entries()) {
        if (data.fileName === oldName) {
          data.fileName = newName;
        }
      }
      
      socket.to(roomId).emit("fileRenamed", { oldName, newName });
      
      const activeUsersInfo = Array.from(room.activeUsers.entries()).map(([userId, data]) => ({
        userId,
        username: room.users.get(userId),
        fileName: data.fileName,
        lastActivity: data.lastActivity
      }));
      io.to(roomId).emit("activeUsersUpdate", activeUsersInfo);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});