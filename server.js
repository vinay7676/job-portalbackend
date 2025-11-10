import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/adminRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import jobRoutes from "./routes/createjobRoutes.js";
import ApplyRoutes from "./routes/applyRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";

// Chat setup
import { setupChat, setupChatRoutes } from "./chat.js";

// Load environment variables
dotenv.config();

const app = express();

// ✅ Dynamic CORS setup (for both local + Render)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL, // e.g. your deployed frontend URL on Render
].filter(Boolean); // Removes undefined or empty entries

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection (clean + retry logic)
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Retry after 5 seconds (useful for Render cold starts)
    setTimeout(connectToMongoDB, 5000);
  }
};

connectToMongoDB();

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/applications", ApplyRoutes);
app.use("/api/pdfs", pdfRoutes);

// ✅ Chat Routes
setupChatRoutes(app);

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "✅ Server is running!" });
});

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Job Portal Backend API!" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

// ✅ HTTP Server + Socket.IO setup
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Chat Socket setup
setupChat(io);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});
