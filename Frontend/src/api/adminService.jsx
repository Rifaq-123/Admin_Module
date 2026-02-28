import api, { setAuthToken } from "./axiosInstance";

/* ===============================
   🔐 Admin Login
================================ */

export const adminLogin = async (credentials) => {
  const res = await api.post("/admin/login", credentials);

  if (res.data?.token) {
    setAuthToken(res.data.token);
  }

  return res.data;
};

/* ===============================
   🧑‍🎓 Student Management
================================ */

export const getStudents = async () => {
  const res = await api.get("/admin/students");
  return res.data;
};

export const getStudentByRollNo = async (rollNo) => {
  const res = await api.get(`/admin/students/roll/${rollNo}`);
  return res.data;
};

export const addStudent = async (data) => {
  const res = await api.post("/admin/students", data);
  return res.data;
};

export const updateStudent = async (id, data) => {
  const res = await api.put(`/admin/students/${id}`, data);
  return res.data;
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/admin/students/${id}`);
  return res.data;
};

/* ===============================
   👩‍🏫 Teacher Management
================================ */

export const getTeachers = async () => {
  const res = await api.get("/admin/teachers");
  return res.data;
};

export const addTeacher = async (data) => {
  const res = await api.post("/admin/teachers", data);
  return res.data;
};

export const updateTeacher = async (id, data) => {
  const res = await api.put(`/admin/teachers/${id}`, data);
  return res.data;
};

export const deleteTeacher = async (id) => {
  const res = await api.delete(`/admin/teachers/${id}`);
  return res.data;
};