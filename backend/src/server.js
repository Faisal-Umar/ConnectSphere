require("dotenv").config({ path: "config.env" });

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

/* ---------------- SOCKET LOGIC ---------------- */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user personal room
  socket.on("setup", (userData) => {
  if (!userData || !userData._id) {
    console.log("⚠️ Invalid userData in setup:", userData);
    return;
  }

  socket.join(userData._id.toString());
  socket.emit("connected");

  console.log("User joined personal room:", userData._id);
});


  // Join chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("Joined chat room:", room);
  });

  // Typing indicators
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  // ✅ FIXED NEW MESSAGE LOGIC
  socket.on("new message", (message) => {
    const chat = message.chat;

    if (!chat || !chat.users) return;

    chat.users.forEach((user) => {
      // 🔥 FIX: ObjectId comparison
      if (user._id.toString() === message.sender._id.toString()) return;

      socket
        .in(user._id.toString())
        .emit("message received", message);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
