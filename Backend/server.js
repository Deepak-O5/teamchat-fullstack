require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db.js");

const app = express();
app.use(express.json());
app.use(cors());

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/message"));
app.use("/api/channels", require("./routes/channels"));

connectDB();

// CREATE SERVER + SOCKET
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// STORE ONLINE USERS
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // --------------------------------------
  // USER ONLINE EVENT
  // --------------------------------------
  socket.on("userOnline", (data) => {
    const exists = onlineUsers.find((u) => u.userId === data.userId);

    if (!exists) {
      onlineUsers.push({
        socketId: socket.id,
        userId: data.userId,
        name: data.name,
        channelId: data.channelId,
      });
    }

    io.emit(
      "onlineUsers",
      onlineUsers.map((u) => ({ userId: u.userId, name: u.name }))
    );
  });

  // JOIN CHANNEL ROOM
  socket.on("joinChannel", (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel ${channelId}`);
  });

  // --------------------------------------
  // REAL TIME MESSAGE
  // --------------------------------------
  socket.on("sendMessage", (data) => {
    io.to(data.channelId).emit("receiveMessage", {
      userId: data.userId,
      text: data.text,
      time: new Date(),
    });
  });

  // --------------------------------------
  // TYPING EVENT
  // --------------------------------------
  socket.on("typing", (data) => {
    socket.to(data.channelId).emit("typing", data);
  });

  // --------------------------------------
  // MESSAGE SEEN
  // --------------------------------------
  socket.on("seen", (data) => {
    socket.to(data.channelId).emit("seenUpdate", data);
  });

  // --------------------------------------
  // USER DISCONNECT
  // --------------------------------------
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);

    io.emit(
      "onlineUsers",
      onlineUsers.map((u) => ({ userId: u.userId, name: u.name }))
    );

    console.log("User disconnected:", socket.id);
  });
});

// START SERVER
server.listen(5000, () => console.log("Server running on 5000"));
