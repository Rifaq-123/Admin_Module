import axios from "axios";
import api, { setAuthToken, logout } from "./axiosInstance";

/**
 * ===============================
 * 🔐 Admin Authentication
 * ===============================
 */
export const adminLogin = async (credentials) => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/admin/login",
      credentials,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      setAuthToken(response.data.token);
      localStorage.setItem("admin", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    console.error("❌ Admin login failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * ===============================
 * 👩‍🏫 Teacher Management
 * ===============================
 */
export const getAllTeachers = async () => {
  const res = await api.get("/admin/teachers");
  return res.data;
};

export const addTeacher = async (data) => {
  const res = await api.post("/admin/teachers", data);
  return res.data;
};

export const updateTeacher = async (id, data) => {
  const res = await api.put(`/admin/teachers/${id}`, data); // ✅ FIXED backticks
  return res.data;
};

export const deleteTeacher = async (id) => {
  const res = await api.delete(`/admin/teachers/${id}`); // ✅ FIXED backticks
  return res.data;
};

/**
 * ===============================
 * 🧑‍🎓 Student Management
 * ===============================
 */
export const getAllStudents = async () => {
  const res = await api.get("/admin/students");
  return res.data;
};

export const getStudentById = async (id) => {
  try {
    const res = await api.get(`/admin/students/${id}`); // ✅ FIXED backticks
    return res.data;
  } catch (err) {
    console.error("❌ Failed to get student by ID:", err);
    throw err;
  }
};

export const addStudent = async (data) => {
  const res = await api.post("/admin/students", data);
  return res.data;
};

export const updateStudent = async (id, data) => {
  const res = await api.put(`/admin/students/${id}`, data); // ✅ FIXED backticks
  return res.data;
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/admin/students/${id}`); // ✅ FIXED backticks
  return res.data;
};

/**
 * ===============================
 * 🚪 Logout
 * ===============================
 */
export { logout };

export default {
  adminLogin,
  getAllTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getAllStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  logout,
};
