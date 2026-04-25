const express = require("express");
const router = express.Router();

const {
  createRequest,
  acceptRequest,
  getAllRequests,
  updateLocation,
  voiceEmergency,
  lowBatteryAlert
} = require("../controllers/requestController");

const auth = require("../middleware/authMiddleware");

// 🚨 Emergency routes
router.post("/create", auth, createRequest);
router.post("/accept", acceptRequest);

// 📊 Dashboard
router.get("/all", getAllRequests);

// 📍 Live tracking
router.post("/update-location", auth, updateLocation);

// 🎙️ Voice trigger
router.post("/voice", auth, voiceEmergency);

// 🔋 Low battery alert
router.post("/low-battery", auth, lowBatteryAlert);

module.exports = router;