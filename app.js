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

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://incongnito-00.github.io"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

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
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", limiter);

// ==============================
// Health Routes
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
  console.log(`🌐 Running on Port ${PORT}`);
  console.log("=================================");
});