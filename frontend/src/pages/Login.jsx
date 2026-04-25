import { useState } from "react";
import API from "../services/api";
import bg from "../assets/bg.jpg";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const res = await API.post("/users/login", form);

      // ✅ Store token
      localStorage.setItem("token", res.data.token);

      // 🔥 Store user (FIXES WRONG EMAIL ISSUE)
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect
      window.location.href = "/home";
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Login Card */}
      <div className="relative z-10 w-[400px] bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-green-500">

        {/* Logo + Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-400">🚑 RoadResQ</h1>
          <p className="text-gray-300 text-sm mt-2">
            Emergency Road Assistance System
          </p>
        </div>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          className="w-full p-3 mb-4 rounded-lg bg-black/50 text-white border border-green-500 focus:outline-none"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          className="w-full p-3 mb-6 rounded-lg bg-black/50 text-white border border-green-500 focus:outline-none"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg transition duration-300"
        >
          Login
        </button>

        {/* Register Link */}
        <p className="text-center text-gray-300 mt-4 text-sm">
          Don't have an account?{" "}
          <span
            className="text-green-400 cursor-pointer hover:underline"
            onClick={() => (window.location.href = "/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;