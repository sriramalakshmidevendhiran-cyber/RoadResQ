require("dotenv").config({ path: "./.env" });
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const path = require("path");


// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();

// 🔥 Rate limiter (MUST be before routes)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // slightly increased for testing
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/request", require("./routes/requestRoutes"));
app.use("/api/places", require("./routes/placesRoutes"));
app.use("/api/nearby", require("./routes/nearbyRoutes"));

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "uploads"))
);


// Create HTTP server
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket connection
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// 🔥 Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Test route
app.get("/", (req, res) => {
  res.send("🚀 RoadResQ Backend Running");
});

// 🔥 Error handler MUST be last
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5001;

// Start server
server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
console.log("📁 Uploads path:", path.join(__dirname, "uploads"));