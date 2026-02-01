import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:5000";

export const socket = io(ENDPOINT, {
  transports: ["websocket"],
  autoConnect: false,
});

export const connectSocket = (user) => {
  if (!user || !user._id) {
    console.error("❌ Socket setup failed: user._id missing", user);
    return;
  }

  socket.connect();
  socket.emit("setup", {
    _id: user._id,
    name: user.name,
    email: user.email,
  });
};
