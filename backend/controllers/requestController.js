const Request = require("../models/Request");
const User = require("../models/User");
const axios = require("axios");
const { sendSMS } = require("../services/smsService");

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 🔧 Nearby search
const getNearby = async (lat, lng, type) => {
  const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

  const res = await axios.get(url, {
    params: {
      location: `${lat},${lng}`,
      radius: 10000,
      type,
      key: GOOGLE_API_KEY,
    },
  });

  return res.data.results.slice(0, 5);
};

// 🔧 Get hospital phone
const getPlaceDetails = async (placeId) => {
  const url = "https://maps.googleapis.com/maps/api/place/details/json";

  const res = await axios.get(url, {
    params: {
      place_id: placeId,
      fields: "name,formatted_phone_number",
      key: GOOGLE_API_KEY,
    },
  });

  return res.data.result;
};

// 🚨 MAIN EMERGENCY
exports.createRequest = async (req, res) => {
  try {
    const { lat, lng, issueType, batteryLow } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location required" });
    }

    // 1. Save request
    const newRequest = await Request.create({
      user: req.user.id,
      location: { lat, lng },
      issueType,
    });

    // 2. Nearby services
    const hospitals = await getNearby(lat, lng, "hospital");
    const police = await getNearby(lat, lng, "police");
    const mechanics = await getNearby(lat, lng, "car_repair");

    // 3. Get hospital contacts (for ambulance)
    let hospitalContacts = [];

    for (let hospital of hospitals.slice(0, 2)) {
      const details = await getPlaceDetails(hospital.place_id);

      hospitalContacts.push({
        name: details.name,
        phone: details.formatted_phone_number || "Not available",
      });
    }

    // 4. Get user
    const user = await User.findById(req.user.id);
    const locationLink = `https://maps.google.com/?q=${lat},${lng}`;

    // 🔥 5. SMART MESSAGE LOGIC
    let alertMessage = `🚨 EMERGENCY 🚨
I need help immediately!

Location:
${locationLink}`;

    // 🔋 Battery priority
    if (batteryLow) {
      alertMessage = `🔋 LOW BATTERY EMERGENCY

User battery is low!

Last location:
${locationLink}

Please respond immediately.`;
    }

    // 🎙️ Voice override
    if (issueType === "voice_emergency") {
      alertMessage = `🎙️ VOICE ALERT

Emergency triggered via voice!

Location:
${locationLink}`;
    }

    // 📡 No signal
    if (issueType === "no_signal") {
      alertMessage = `📡 NO SIGNAL ALERT

User lost network.

Last known location:
${locationLink}`;
    }

    // 6. SEND SMS
    if (user && user.emergencyContacts.length > 0) {
      for (let contact of user.emergencyContacts) {
        const phone = contact.phone.startsWith("+91")
          ? contact.phone
          : `+91${contact.phone}`;

        await sendSMS(phone, alertMessage);
      }
    }

    // 7. SOCKET EVENT
    req.io.emit("newEmergency", newRequest);

    // 8. ESCALATION (no response)
    setTimeout(async () => {
      const updatedRequest = await Request.findById(newRequest._id);

      if (updatedRequest.status === "pending") {
        for (let contact of user.emergencyContacts) {
          const phone = contact.phone.startsWith("+91")
            ? contact.phone
            : `+91${contact.phone}`;

          await sendSMS(
            phone,
            `⚠️ URGENT: User not responding!

Last Location:
${locationLink}`
          );
        }

        console.log("🚨 ESCALATION SENT");
      }
    }, 30000);

    // 9. RESPONSE (🔥 includes ambulance suggestion)
    res.status(201).json({
      message: "Emergency triggered successfully",
      request: newRequest,
      nearby: {
        hospitals,
        police,
        mechanics,
        hospitalContacts,
      },
      ambulanceSuggestion: hospitalContacts[0] || null,
    });

  } catch (error) {
    console.log("❌ ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🎙️ VOICE TRIGGER
exports.voiceEmergency = async (req, res) => {
  req.body.issueType = "voice_emergency";
  return exports.createRequest(req, res);
};

// 🔋 LOW BATTERY API
exports.lowBatteryAlert = async (req, res) => {
  req.body.batteryLow = true;
  return exports.createRequest(req, res);
};

// 🔧 ACCEPT REQUEST
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "accepted";
    await request.save();

    req.io.emit("requestAccepted", request);

    res.json({
      message: "Request accepted",
      request,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📊 DASHBOARD
exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) filter.status = status;

    const requests = await Request.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      count: requests.length,
      requests,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📍 LIVE LOCATION
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      lastLocation: { lat, lng },
    });

    req.io.emit("liveLocation", {
      userId: req.user.id,
      lat,
      lng,
    });

    res.json({ message: "Location updated" });

  } catch (error) {
    res.status(500).json({ message: "Error updating location" });
  }
};