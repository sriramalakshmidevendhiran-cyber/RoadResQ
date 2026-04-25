const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (to, message) => {
  try {
    console.log("📤 Sending SMS to:", to);

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to,
    });

    console.log("✅ SMS SENT, SID:", response.sid);

  } catch (error) {
    console.log("❌ SMS ERROR:", error.message);
  }
};