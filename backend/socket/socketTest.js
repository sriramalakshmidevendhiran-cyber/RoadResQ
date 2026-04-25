const io = require("socket.io-client");

// connect to backend
const socket = io("http://localhost:5001");

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
});

// listen for emergency event
socket.on("newEmergency", (data) => {
  console.log("🚨 NEW EMERGENCY RECEIVED:");
  console.log(data);
});
socket.on("requestAccepted", (data) => {
  console.log("✅ REQUEST ACCEPTED:", data);
});