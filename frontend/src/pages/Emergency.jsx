import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import PlacesMap from "../components/PlacesMap";
import API from "../services/api";

function Emergency() {

  const token = localStorage.getItem("token");

  // 🎙️ RECORDING STATES
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🌐 ONLINE / OFFLINE
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 🧠 SMART ALERT STATES
  const [alertBox, setAlertBox] = useState(null);
  const [countdown, setCountdown] = useState(180); // 3 mins

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // 🚨 MERGED EMERGENCY FUNCTION
  const sendEmergency = async () => {

    if (!isOnline) {
      alert("⚠️ Offline Mode Activated");
      window.open("tel:108");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          await API.post(
            "/users/emergency",
            {
              lat: latitude,
              lng: longitude,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          alert("🚨 Emergency alert sent successfully!");
        } catch (err) {
          console.log(err);
          alert("Failed to send emergency alert");
        }
      },
      () => {
        alert("Location permission denied");
      }
    );
  };

  // 🎙️ START RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecording(true);

    } catch (err) {
      alert("Microphone access denied");
    }
  };

  // 🎙️ STOP + SEND RECORDING
  const stopRecording = async () => {
    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = async () => {

      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/mp3",
      });

      const formData = new FormData();
      formData.append("audio", audioBlob);

      try {
        await API.post("/users/upload-audio", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        alert("🎙️ Voice alert sent successfully!");
      } catch (err) {
        console.log(err);
        alert("Error sending voice alert");
      }
    };

    setRecording(false);
  };

  // ================= SMART SYSTEM =================

  // 🚨 Trigger Smart Alert
  const triggerSmartEmergency = (reason) => {
    console.log("⚠️ Trigger:", reason);
    setAlertBox(reason);
    setCountdown(180);
  };

  // ⏳ Countdown Logic
  useEffect(() => {
    if (!alertBox) return;

    if (countdown <= 0) {
      console.log("🚨 No response → sending emergency");
      setAlertBox(null);
      sendEmergency();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);

  }, [alertBox, countdown]);

  // ❌ Cancel Alert
  const cancelEmergency = () => {
    console.log("✅ User cancelled");
    setAlertBox(null);
  };

  

  // 🔴 ACCIDENT DETECTION
  useEffect(() => {
    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;

      if (!acc) return;

      const impact =
        Math.abs(acc.x) > 20 ||
        Math.abs(acc.y) > 20 ||
        Math.abs(acc.z) > 20;

      if (impact) {
        console.log("🚨 Possible accident detected");
        triggerSmartEmergency("Possible accident detected");
      }
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, []);
  // 💻 STRICT LAPTOP SHAKE DETECTION (10+ STRONG MOVEMENTS)
useEffect(() => {
  let lastX = null;
  let lastDirection = null;
  let shakeCount = 0;
  let lastTime = Date.now();

  const REQUIRED_SHAKES = 10;   // 🔥 must shake 10 times
  const TIME_WINDOW = 1200;     // within 1.2 sec

  const handleMouseMove = (e) => {
    const now = Date.now();

    if (lastX === null) {
      lastX = e.clientX;
      return;
    }

    const dx = e.clientX - lastX;

    // Ignore small movements
    if (Math.abs(dx) < 25) return;

    // Detect direction (left / right)
    const direction = dx > 0 ? "right" : "left";

    // Count only if direction changes (real shake)
    if (direction !== lastDirection) {
      shakeCount++;
      lastDirection = direction;
      lastTime = now;

      console.log("🔁 Shake count:", shakeCount);
    }

    // Reset if too slow
    if (now - lastTime > TIME_WINDOW) {
      shakeCount = 0;
    }

    // 🔥 Trigger only after strong shaking
    if (shakeCount >= REQUIRED_SHAKES) {
      console.log("💻 Strong shake confirmed");

      triggerSmartEmergency("Simulated accident (strong laptop shake)");

      shakeCount = 0; // reset after trigger
    }

    lastX = e.clientX;
  };

  window.addEventListener("mousemove", handleMouseMove);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
  };
}, []);
  // ================= UI =================

  return (
    <Layout>

      <h2 className="text-red-500 text-xl mb-4">
        🚨 Emergency Mode
      </h2>

      <button
        onClick={sendEmergency}
        className="bg-red-600 w-full p-4 rounded-xl mb-4 text-white font-bold"
      >
        Send Emergency Alert
      </button>

      <button
        onClick={recording ? stopRecording : startRecording}
        className="bg-green-500 w-full p-3 rounded-xl text-black font-bold"
      >
        {recording ? "⏹ Stop & Send Voice" : "🎙️ Start Voice Alert"}
      </button>

      <div className="mt-6">
        <h3 className="text-green-400 mb-2">Nearby Hospitals</h3>
        <PlacesMap type="hospital" />
      </div>

      {/* 🚨 SMART POPUP */}
      {alertBox && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl text-center w-[90%] max-w-md border border-red-500">

            <h2 className="text-red-500 text-lg font-bold mb-3">
              ⚠️ Emergency Detected
            </h2>

            <p className="text-white mb-3">{alertBox}</p>

            <p className="text-yellow-400 mb-4">
              ⏳ Sending alert in {countdown} seconds
            </p>

            <button
              onClick={cancelEmergency}
              className="bg-green-500 px-4 py-2 rounded text-black font-bold"
            >
              I'm Safe (Cancel)
            </button>

          </div>
        </div>
      )}

    </Layout>
  );
}

export default Emergency;