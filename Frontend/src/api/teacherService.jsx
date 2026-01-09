import api, { setAuthToken, logout } from "./axiosInstance";

// ===============================
// 👩‍🏫 Teacher Authentication
// ===============================
export const teacherLogin = async (data) => {
  const res = await api.post("/auth/login", { ...data, role: "TEACHER" });
  if (res.data?.token) setAuthToken(res.data.token);
  return res;
};

export const teacherRegister = (data) =>
  api.post("/auth/register", { ...data, role: "TEACHER" });

// ===============================
// 📊 Manage Marks
// ===============================
export const getAllMarks = () => api.get("/teacher/marks");
export const getMarksByStudent = (id) => api.get(`/teacher/marks/${id}`);
export const updateMarks = (id, marksData) => api.put(`/teacher/marks/${id}`, marksData);

// ===============================
// 🗓️ Manage Attendance
// ===============================
export const getAttendanceByStudent = (id) => api.get(`/teacher/attendance/${id}`);
export const updateAttendance = (id, attendanceData) =>
  api.put(`/teacher/attendance/${id}`, attendanceData);

// ===============================
// 👤 Teacher Profile
// ===============================
export const getTeacherProfile = (id) => api.get(`/teacher/profile/${id}`);
export const updateTeacherProfile = (id, data) => api.put(`/teacher/profile/${id}`, data);

// ===============================
// 🚪 Logout
// ===============================
export { logout };

export default {
  teacherLogin,
  teacherRegister,
  getAllMarks,
  getMarksByStudent,
  updateMarks,
  getAttendanceByStudent,
  updateAttendance,
  getTeacherProfile,
  updateTeacherProfile,
  logout,
};
