import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./utils/db.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let activeUserCount = 0;

io.on("connection", (socket) => {
  activeUserCount++;
  io.emit("activeUsers", activeUserCount);

  socket.on("disconnect", () => {
    activeUserCount = Math.max(0, activeUserCount - 1);
    io.emit("activeUsers", activeUserCount);
  });
});

(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("❌ DB connection error:", e);
    process.exit(1);
  }
})();
