const mongoose = require("mongoose");

// 📞 Emergency Contact Schema
const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

// 👤 Main User Schema
const userSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    // 🔹 Role System (future use)
    role: {
      type: String,
      enum: ["user", "provider", "admin"],
      default: "user",
    },

    // 🚨 Emergency Contacts
    emergencyContacts: [emergencyContactSchema],

    // 📍 Last Known Location (for low network / battery)
    lastLocation: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);