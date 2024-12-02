import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { connectDB } from "./src/config/database";
import userRoutes from "./src/routes/userRoutes";
import roomRoutes from "./src/routes/roomRoutes";
import * as path from "path";
import { MessageModel } from "./src/models/messageModel";
import { fileURLToPath } from 'url';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

// เชื่อมต่อ MongoDB
connectDB();

// Socket.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("message", ({ roomId, message }) => {
    // บันทึกข้อความลงฐานข้อมูล
    saveMessage(roomId, message);
    // ส่งข้อความไปยังทุกคนในห้อง
    io.to(roomId).emit("newMessage", message);
  });

  socket.on("leaveRoom", (roomId: string) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

async function saveMessage(roomId: string, message: any) {
  try {
    const newMessage = new MessageModel({
      ...message,
      roomId,
    });
    await newMessage.save();
  } catch (error) {
    console.error("Error saving message:", error);
  }
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
