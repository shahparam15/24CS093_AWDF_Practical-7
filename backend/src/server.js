import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration supporting Vite frontend development ports
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development
      }
    },
    credentials: true,
  })
);

// Standard Body Parser & Logger
app.use(express.json());
app.use(requestLogger);

// Health and Root Documentation Endpoints
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CHARUSAT ITUE301 Practical 7: Authentication & Middleware API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /auth/register or /api/auth/register",
        login: "POST /auth/login or /api/auth/login",
        me: "GET /auth/me or /api/auth/me (Protected)",
      },
      tasks: {
        list: "GET /tasks or /api/tasks (Protected)",
        get: "GET /tasks/:id or /api/tasks/:id (Protected)",
        create: "POST /tasks or /api/tasks (Protected)",
        update: "PUT /tasks/:id or /api/tasks/:id (Protected)",
        delete: "DELETE /tasks/:id or /api/tasks/:id (Protected)",
      },
    },
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes (supporting both /auth and /api/auth, /tasks and /api/tasks)
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

app.use("/tasks", taskRoutes);
app.use("/api/tasks", taskRoutes);

// 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Resource not found on endpoint: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server if not running inside test runner
if (process.env.NODE_ENV !== "test" && !process.argv.some((arg) => arg.includes("--test"))) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

export default app;
