require("dotenv").config();
require("./config/database");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

// ==============================
// Security
// ==============================

app.use(helmet());

// ==============================
// CORS
// ==============================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

// ==============================
// Body Parser
// ==============================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==============================
// Logger
// ==============================

app.use(morgan("dev"));

// ==============================
// Rate Limiter
// ==============================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 200,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", limiter);

// ==============================
// Health Route
// ==============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    project: "Projexa V4",
    version: "4.0.0",
    status: "Running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    database: "Checking...",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ==============================
// API Routes
// ==============================

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/projects", require("./routes/project.routes"));

// ==============================
// 404 Handler
// ==============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==============================
// Global Error Handler
// ==============================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ==============================
// Server
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 Projexa V4 Server Started");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("=================================");
});