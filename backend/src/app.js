const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Database connection health check middleware to prevent timeouts
app.use((req, res, next) => {
  if (req.path === "/") return next();

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is offline. Please configure a valid MONGODB_URI in backend/config.env or launch a local MongoDB instance."
    });
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("ConnectSphere Backend Running");
});

module.exports = app;
