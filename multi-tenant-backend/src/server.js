import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// ✅ Load environment variables FIRST
dotenv.config();

const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server from Express app
const server = http.createServer(app);

// ✅ Attach Socket.io to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join a team room (teamId acts as the room name)
  socket.on("join_team", (teamId) => {
    socket.join(teamId);
    console.log(`👥 Socket ${socket.id} joined team room: ${teamId}`);
  });

  // Leave a team room
  socket.on("leave_team", (teamId) => {
    socket.leave(teamId);
    console.log(`👋 Socket ${socket.id} left team room: ${teamId}`);
  });

  // Join a private chat room (chatId as the room name)
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`🔒 Socket ${socket.id} joined chat room: ${chatId}`);
  });

  // Leave a private chat room
  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
    console.log(`👋 Socket ${socket.id} left chat room: ${chatId}`);
  });

  // Receive a message and broadcast
  socket.on("send_message", (data) => {
    const { chatId, teamId, message, chatType, participants } = data;

    if (chatType === "private") {
      // Private: emit to the chatId-specific room (only participants joined this room)
      socket.to(chatId).emit("receive_message", { chatId, teamId, message, chatType, participants });
    } else {
      // Group: Broadcast to everyone in the team room except sender
      socket.to(teamId).emit("receive_message", { chatId, teamId, message, chatType });
    }

    console.log(`📨 Message broadcasted to ${chatType === "private" ? `chat:${chatId}` : `team:${teamId}`} (${chatType})`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Make io accessible to routes if needed
app.set("io", io);

// ✅ Start server only after DB connects
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
      console.log(`Socket.io attached and listening 🔌`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();