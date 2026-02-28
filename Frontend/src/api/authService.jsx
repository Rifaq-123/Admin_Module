import api, { setAuthToken, logout } from "./axiosInstance";

// Universal Login (Admin / Teacher / Student)
export const login = async (data) => {
  const res = await api.post("/auth/login", data);

  if (res.data?.token) {
    setAuthToken(res.data.token);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data));
  }

  return res.data;
};

// export const register = async (data) => {
//   const res = await api.post("/auth/register", data);
//   return res.data;
// };

// export const verifyOtp = async (email, otp) => {
//   const res = await api.post("/auth/verify-otp", { email, otp });
//   return res.data;
// };

export { logout };