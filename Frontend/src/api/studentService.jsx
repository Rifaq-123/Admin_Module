import api, { setAuthToken, logout } from "./axiosInstance";

// ===============================
// 🧑‍🎓 Student Authentication
// ===============================
export const studentLogin = async (data) => {
  const res = await api.post("/auth/login", { ...data, role: "STUDENT" });
  if (res.data?.token) setAuthToken(res.data.token);
  return res;
};

export const studentRegister = (data) =>
  api.post("/auth/register", { ...data, role: "STUDENT" });

// ===============================
// 📊 View Marks
// ===============================
export const getMyMarks = (id) => api.get(`/student/marks/${id}`);

// ===============================
// 🗓️ View Attendance
// ===============================
export const getMyAttendance = (id) => api.get(`/student/attendance/${id}`);

// ===============================
// 👤 Profile
// ===============================
export const getMyProfile = (id) => api.get(`/student/profile/${id}`);
export const updateMyProfile = (id, data) => api.put(`/student/profile/${id}`, data);

// ===============================
// 🚪 Logout
// ===============================
export { logout };

export default {
  studentLogin,
  studentRegister,
  getMyMarks,
  getMyAttendance,
  getMyProfile,
  updateMyProfile,
  logout,
};
