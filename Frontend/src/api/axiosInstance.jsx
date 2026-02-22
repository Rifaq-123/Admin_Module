import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE || "https://student-management-backend-iftd.onrender.com/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://student-management-backend-iftd.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach token to all requests except login
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (
      token &&
      !config.url.includes("/admin/login") &&
      !config.url.includes("/admin/otp")
    ) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ FIXED backticks
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Session expired, redirecting to login...");
      localStorage.clear();
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// ✅ Helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`; // ✅ FIXED
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

export const logout = () => {
  localStorage.clear();
  delete api.defaults.headers.common["Authorization"];
  window.location.href = "/admin/login";
};

export default api;
