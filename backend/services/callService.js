const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);
console.log("📞 TWILIO PHONE:", process.env.TWILIO_PHONE);


exports.makeCall = async (to, audioUrl) => {
  try {
    const call = await client.calls.create({
      url: `${process.env.BASE_URL}/api/users/voice-response?audio=${encodeURIComponent(audioUrl)}`,
      to,
      from: process.env.TWILIO_PHONE,
    });

    console.log("📞 CALL SID:", call.sid);
    return call;

  } catch (err) {
    console.log("❌ CALL ERROR:", err.message);
  }
};