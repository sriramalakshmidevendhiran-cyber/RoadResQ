const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  location: {
    lat: Number,
    lng: Number,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed"],
    default: "pending",
  },
  issueType: {
    type: String,
    default: "general",
  },
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);