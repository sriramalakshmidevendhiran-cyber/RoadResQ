const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const path = require("path");
const fs = require("fs");

const { sendSMS } = require("../services/smsService");
const { makeCall } = require("../services/callService");

// 🔐 REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📞 ADD CONTACT
exports.addEmergencyContact = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user.id);

    user.emergencyContacts.push({ name, phone });

    await user.save();

    res.json({
      message: "Emergency contact added",
      contacts: user.emergencyContacts,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📞 GET CONTACTS
exports.getEmergencyContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.emergencyContacts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ DELETE CONTACT
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.emergencyContacts = user.emergencyContacts.filter(
      (c) => c._id.toString() !== req.params.id
    );

    await user.save();

    res.json({
      message: "Contact deleted",
      contacts: user.emergencyContacts,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🚨 SEND TEXT EMERGENCY
exports.sendEmergencyAlert = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const user = await User.findById(req.user.id);

    const message = `🚨 Emergency!
Location: https://maps.google.com/?q=${lat},${lng}`;

    for (let contact of user.emergencyContacts) {
      await sendSMS(contact.phone, message);

      // optional: keep or remove call here
      // await makeCall(contact.phone, "https://example.com/test.mp3");
    }

    res.json({ message: "Emergency handled" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
};

// 🎙️ VOICE ALERT
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

exports.uploadAudioController = async (req, res) => {
  try {
    console.log("🎤 ENTERED VOICE CONTROLLER");

    if (!req.file) {
      return res.status(400).json({ message: "No audio uploaded" });
    }

    const inputPath = path.join(__dirname, "..", "uploads", req.file.filename);

    // ✅ FIXED filename
    const fileNameWithoutExt = req.file.filename.split(".")[0];
    const outputFileName = fileNameWithoutExt + ".wav";

    const outputPath = path.join(__dirname, "..", "uploads", outputFileName);

    console.log("📂 Converting:", inputPath);

    // 🔄 Convert to WAV
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat("wav")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    console.log("✅ Converted:", outputFileName);

    // ✅ FINAL AUDIO URL
    const audioUrl = `${process.env.BASE_URL}/uploads/${outputFileName}`;
    console.log("🎯 FINAL AUDIO URL:", audioUrl);

    

    // 📞 CALL USERS WITH CORRECT AUDIO
    const user = await User.findById(req.user.id);

    for (let contact of user.emergencyContacts) {
      await sendSMS(
    contact.phone,
    `🚨 Emergency Voice Alert!\nListen here:\n${audioUrl}`
  );
      await makeCall(contact.phone, audioUrl);
    }

    res.json({ message: "Voice alert + call sent!" });

  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({ message: "Error sending voice alert" });
  }
};

// 🎙️ TWILIO RESPONSE
exports.voiceResponse = (req, res) => {
  try {
    const audioUrl = req.query.audio;

    console.log("🎯 TWILIO USING AUDIO:", audioUrl);

    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Play>${audioUrl}</Play>
      </Response>
    `);

  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).send("Error");
  }
};

// 📞 TRIGGER CALL
exports.triggerCall = async (req, res) => {
  try {
    const { audioUrl } = req.body;

    const user = await User.findById(req.user.id);

    for (let contact of user.emergencyContacts) {
      await makeCall(contact.phone, audioUrl);
    }

    res.json({ message: "Calls triggered!" });

  } catch (err) {
    res.status(500).json({ message: "Call failed" });
  }
};