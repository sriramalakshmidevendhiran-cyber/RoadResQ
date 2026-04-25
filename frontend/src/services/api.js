import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
  timeout: 10000, // ✅ prevent hanging requests
});

// ✅ Attach token automatically (no need to add in every request)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", error.response?.data || error.message);

    // Optional: handle unauthorized
    if (error.response?.status === 401) {
      console.warn("Unauthorized - please login again");
    }

    return Promise.reject(error);
  }
);

export default API;