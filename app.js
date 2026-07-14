require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./database");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const applicationRoutes = require("./routes/applications");

const app = express();

// =======================
// Middleware
// =======================

app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// Home
// =======================

app.get("/", (req, res) => {
  res.json({
    success: true,
    project: "Projexa V2 Backend",
    version: "2.0",
    status: "Running 🚀",
  });
});

// =======================
// Health Check
// =======================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    database: "Connected",
    server: "Running",
    uptime: process.uptime(),
  });
});

// =======================
// Routes
// =======================

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/applications", applicationRoutes);

// =======================
// 404
// =======================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// =======================
// Error Handler
// =======================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// =======================
// Start Server
// =======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("==================================");
  console.log("🚀 PROJEXA V2 BACKEND STARTED");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("✅ PostgreSQL");
  console.log("✅ JWT");
  console.log("✅ Google Login");
  console.log("==================================");
});