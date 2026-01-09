import api, { setAuthToken, logout } from "./axiosInstance";

// ===============================
// 🔐 Universal Auth (Login/Register/Verify OTP)
// ===============================
export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  if (res.data?.token) setAuthToken(res.data.token);
  return res;
};

export const register = (data) => api.post("/auth/register", data);

export const verifyOtp = (email, otp) => api.post("/auth/verify-otp", { email, otp });

// ===============================
// 🚪 Logout
// ===============================
export { logout };

export default {
  login,
  register,
  verifyOtp,
  logout,
};
