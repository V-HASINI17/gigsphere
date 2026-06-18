const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Import Security Middleware
const { secureHeaders, sanitizeInput, rateLimiter } = require("./middleware/securityMiddleware");

connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for local/dev environments
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Apply Security Middlewares
app.use(secureHeaders);
app.use(cors());
app.use(express.json());
app.use(mongoSanitize()); // Strip MongoDB operators ($gt, $where, etc.) from req.body/query
app.use(sanitizeInput);

// Apply Global Rate Limiting (150 requests per 15 minutes)
app.use(rateLimiter(150, 15 * 60 * 1000));

// Bind API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("GigSphere Backend Running 🚀");
});

// Socket.io Real-Time Communications
const onlineUsers = new Map(); // Map of userId -> Set<socket.id>

const getChatRoomId = (gigId, firstUserId, secondUserId) => {
  const participants = [String(firstUserId), String(secondUserId)].sort().join(":");
  return `gig:${gigId}:users:${participants}`;
};

const addOnlineUser = (userId, socketId) => {
  const normalizedUserId = String(userId);
  const sockets = onlineUsers.get(normalizedUserId) || new Set();
  sockets.add(socketId);
  onlineUsers.set(normalizedUserId, sockets);
};

const removeSocketFromOnlineUsers = (socketId) => {
  let disconnectedUser = null;

  for (const [userId, socketIds] of onlineUsers.entries()) {
    socketIds.delete(socketId);

    if (socketIds.size === 0) {
      disconnectedUser = userId;
      onlineUsers.delete(userId);
    }
  }

  return disconnectedUser;
};

const emitOnlineStatus = () => {
  const users = Array.from(onlineUsers.keys());
  io.emit("onlineStatus", users);
  io.emit("online_users", users); // Backward-compatible alias for older clients.
};

const emitToUser = (userId, eventName, payload, exceptSocket) => {
  const socketIds = onlineUsers.get(String(userId));
  if (!socketIds) return;

  socketIds.forEach((socketId) => {
    if (socketId !== exceptSocket?.id) {
      io.to(socketId).emit(eventName, payload);
    }
  });
};

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // Register online status
  const registerOnlineUser = (userId) => {
    if (userId) {
      socket.data.userId = String(userId);
      addOnlineUser(userId, socket.id);
      emitOnlineStatus();
      console.log(`User registered online: ${userId}`);
    }
  };

  socket.on("registerUser", registerOnlineUser);
  socket.on("register_user", registerOnlineUser);

  // Join gig-specific room
  socket.on("joinRoom", ({ gigId, otherUserId }) => {
    const currentUserId = socket.data.userId;
    if (!gigId || !otherUserId || !currentUserId) return;

    const roomId = getChatRoomId(gigId, currentUserId, otherUserId);
    socket.join(roomId);
    socket.emit("roomJoined", { roomId, gigId, otherUserId });
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on("join_room", ({ roomId }) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.emit("roomJoined", { roomId });
    console.log(`Socket ${socket.id} joined legacy room: ${roomId}`);
  });

  socket.on("leaveRoom", ({ gigId, otherUserId, roomId }) => {
    const currentUserId = socket.data.userId;
    const resolvedRoomId = roomId || (gigId && otherUserId && currentUserId
      ? getChatRoomId(gigId, currentUserId, otherUserId)
      : null);

    if (!resolvedRoomId) return;
    socket.leave(resolvedRoomId);
    socket.emit("roomLeft", { roomId: resolvedRoomId, gigId, otherUserId });
  });

  // Real-time chat messaging
  const handleSendMessage = async (data) => {
    const { receiverId, gigId, message } = data;
    const senderIdRaw = socket.data.userId || data.senderId;
    try {
      if (!senderIdRaw || !receiverId || !gigId || !message?.trim()) {
        socket.emit("messageError", { message: "senderId, receiverId, gigId, and message are required" });
        return;
      }

      // Cast to ObjectId to avoid Mongoose cast errors
      const senderId = new mongoose.Types.ObjectId(senderIdRaw);

      const Message = require("./models/Message");
      const newMessage = await Message.create({
        senderId,
        receiverId,
        gigId,
        message: message.trim(),
        isRead: false
      });

      const roomId = getChatRoomId(gigId, senderId, receiverId);

      // Emit message to all clients in the room
      io.to(roomId).emit("receiveMessage", newMessage);
      io.to(roomId).emit("receive_message", newMessage);
      
      // Send real-time notification to the receiver when they are connected elsewhere.
      emitToUser(receiverId, "notification", {
        type: "new_message",
        message: "New message received",
        senderId,
        gigId,
        roomId
      }, socket);
    } catch (err) {
      console.error("Error saving socket message:", err.message);
      socket.emit("messageError", { message: "Unable to send message" });
    }
  };

  socket.on("sendMessage", handleSendMessage);
  socket.on("send_message", handleSendMessage);

  // Typing status broadcasts
  socket.on("typingStart", ({ gigId, receiverId }) => {
    const senderId = socket.data.userId;
    if (!senderId || !receiverId || !gigId) return;

    const roomId = getChatRoomId(gigId, senderId, receiverId);
    socket.to(roomId).emit("typingStart", { senderId, gigId, roomId });
    socket.to(roomId).emit("user_typing", { senderId, gigId, roomId });
  });

  socket.on("typingStop", ({ gigId, receiverId }) => {
    const senderId = socket.data.userId;
    if (!senderId || !receiverId || !gigId) return;

    const roomId = getChatRoomId(gigId, senderId, receiverId);
    socket.to(roomId).emit("typingStop", { senderId, gigId, roomId });
  });

  socket.on("typing", ({ roomId, isTyping, userId }) => {
    if (!roomId) return;
    socket.to(roomId).emit("typing_status", { isTyping, userId });
  });

  // Read receipts
  socket.on("readReceipt", async ({ messageId, gigId, otherUserId }) => {
    try {
      const currentUserId = socket.data.userId;
      if (!messageId || !gigId || !otherUserId || !currentUserId) return;

      const Message = require("./models/Message");
      const updatedMessage = await Message.findOneAndUpdate(
        { _id: messageId, receiverId: currentUserId, gigId },
        { isRead: true },
        { new: true }
      );

      if (!updatedMessage) return;

      const roomId = getChatRoomId(gigId, currentUserId, otherUserId);
      io.to(roomId).emit("readReceipt", { messageId, gigId, readBy: currentUserId });
      io.to(roomId).emit("messages_read", { messageId, gigId, readBy: currentUserId });
    } catch (err) {
      console.error("Error updating message read status:", err.message);
    }
  });

  socket.on("message_read", async ({ messageId, roomId }) => {
    try {
      if (!messageId || !roomId) return;

      const Message = require("./models/Message");
      await Message.findByIdAndUpdate(messageId, { isRead: true });
      socket.to(roomId).emit("message_read_update", { messageId });
    } catch (err) {
      console.error("Error updating legacy message read status:", err.message);
    }
  });

  // Handle Disconnect
  socket.on("disconnect", () => {
    const disconnectedUser = removeSocketFromOnlineUsers(socket.id);
    if (disconnectedUser) {
      emitOnlineStatus();
      console.log(`User went offline: ${disconnectedUser}`);
    }
    console.log(`Socket Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
