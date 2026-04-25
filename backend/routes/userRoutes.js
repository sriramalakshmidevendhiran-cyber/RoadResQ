const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// ✅ FIXED MULTER (adds .mp3 extension)
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"), // ✅ FIXED HERE

  filename: (req, file, cb) => {
    const ext = ".webm"; 
    const name = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, name);
  },
});


const upload = multer({ storage });

const {
  registerUser,
  loginUser,
  addEmergencyContact,
  getEmergencyContacts,
  deleteEmergencyContact,
  sendEmergencyAlert,
  uploadAudioController,
  voiceResponse,
  triggerCall, // ✅ already correct
} = require("../controllers/userController");

const auth = require("../middleware/authMiddleware");

// 🔐 AUTH ROUTES
router.post("/register", registerUser);
router.post("/login", loginUser);

// 📞 CONTACT ROUTES
router.post("/add-contact", auth, addEmergencyContact);
router.get("/contacts", auth, getEmergencyContacts);
router.delete("/contact/:id", auth, deleteEmergencyContact);
router.post("/call", auth, triggerCall);
router.get("/voice-response", voiceResponse);

// 🚨 EMERGENCY SMS
router.post("/emergency", auth, sendEmergencyAlert);

// 🎙️ VOICE ALERT (UPLOAD AUDIO + SEND SMS)
router.post(
  "/upload-audio",
  auth,
  upload.single("audio"), // ✅ now saves .mp3 properly
  uploadAudioController
);

// 🧪 TEST ROUTE
router.get("/test", (req, res) => {
  res.send("User route working");
});

module.exports = router;