require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/authRoutes"); // Import authRoutes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON requests
app.use(express.json());

// Enable CORS for the frontend (React running on port 3000)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",  // Use environment variable for frontend URL
  credentials: true,
}));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Use the API routes
app.use("/api/auth", authRoutes);  // Register authRoutes under /api/auth

// Serve React frontend in production (if applicable)
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

// Serve the React app for all other routes (catch-all route)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: "Server error, please try again later", error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
