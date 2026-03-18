// api/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// ✅ Request Interceptor - Attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Don't add token to login endpoints
    const publicEndpoints = ["/admin/login", "/teacher/login", "/student/login", "/setup/"];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ Response from ${response.config.url}:`, response.status);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;
    const isLoginPage = path.includes("/login");

    // Handle 401 Unauthorized
    if (status === 401 && !isLoginPage) {
      console.log("🔐 Session expired - redirecting to home...");
      
      // Clear all auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      delete api.defaults.headers.common["Authorization"];
      
      // Show message and redirect
      alert("Your session has expired. Please login again.");
      window.location.href = "/";
      
      return new Promise(() => {}); // Never resolves - prevents further execution
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.log("🚫 Access forbidden");
      window.location.href = "/";
      return new Promise(() => {});
    }

    // Handle 429 Too Many Requests
    if (status === 429) {
      const message = error.response?.data?.message || "Too many requests. Please try again later.";
      console.error("⏰ Rate limited:", message);
    }

    // Handle 500 Server Error
    if (status >= 500) {
      console.error("💥 Server error:", error.response?.data);
    }

    // Extract error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    // Create enriched error object
    const enrichedError = new Error(message);
    enrichedError.status = status;
    enrichedError.data = error.response?.data;
    enrichedError.originalError = error;

    return Promise.reject(enrichedError);
  }
);

// ✅ Set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

// ✅ Clear auth and redirect to home
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  delete api.defaults.headers.common["Authorization"];
  window.location.href = "/";
};

// ✅ Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

// ✅ Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// ✅ Get current role
export const getCurrentRole = () => {
  return localStorage.getItem("role");
};

export default api;