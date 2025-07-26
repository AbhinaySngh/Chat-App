import express from 'express';
import "dotenv/config";
import http from 'http';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server} from 'socket.io';
import { log } from 'console';

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Setup Socket.IO
export const io = new Server(server, {
  cors: { origin: "*" } 
});

// Store online users
export const userSocketMap = {};  // {userId: socketId}

// Socket.IO connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User connected: ${userId}`);

  if (userId) {
    userSocketMap[userId] = socket.id; // Map userId to socketId
  }

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    delete userSocketMap[userId]; // Remove user from online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Update online users
  })
})

// Middleware setup
app.use(express.json({limit: '4mb'}));
app.use(cors());

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});