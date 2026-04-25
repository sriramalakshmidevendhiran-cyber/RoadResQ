import { useState } from "react";
import API from "../services/api";
import bg from "../assets/bg.jpg";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleRegister = async () => {
    try {
      await API.post("/users/register", form);
      alert("Registered successfully");
      window.location.href = "/";
    } catch (err) {
      alert("Error");
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Register Card */}
      <div className="relative z-10 w-[420px] bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-green-500">

        {/* Logo + Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-400">🚑 RoadResQ</h1>
          <p className="text-gray-300 text-sm mt-2">
            Create your account
          </p>
        </div>

        {/* Inputs */}
        <input
          placeholder="Full Name"
          className="w-full p-3 mb-3 rounded-lg bg-black/50 text-white border border-green-500"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="w-full p-3 mb-3 rounded-lg bg-black/50 text-white border border-green-500"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Phone"
          className="w-full p-3 mb-3 rounded-lg bg-black/50 text-white border border-green-500"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-lg bg-black/50 text-white border border-green-500"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {/* Button */}
        <button
          onClick={handleRegister}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg transition duration-300"
        >
          Register
        </button>

        {/* Login Link */}
        <p className="text-center text-gray-300 mt-4 text-sm">
          Already have an account?{" "}
          <span
            className="text-green-400 cursor-pointer hover:underline"
            onClick={() => (window.location.href = "/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;