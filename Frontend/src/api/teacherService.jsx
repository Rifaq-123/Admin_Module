import api from "./axiosInstance";

export const getAllMarks = async () => {
  const res = await api.get("/teacher/marks");
  return res.data;
};

export const getMarksByStudent = async (id) => {
  const res = await api.get(`/teacher/marks/${id}`);
  return res.data;
};

export const updateMarks = async (id, marksData) => {
  const res = await api.put(`/teacher/marks/${id}`, marksData);
  return res.data;
};

export const getAttendanceByStudent = async (id) => {
  const res = await api.get(`/teacher/attendance/${id}`);
  return res.data;
};

export const updateAttendance = async (id, attendanceData) => {
  const res = await api.put(`/teacher/attendance/${id}`, attendanceData);
  return res.data;
};

export const getTeacherProfile = async (id) => {
  const res = await api.get(`/teacher/profile/${id}`);
  return res.data;
};

export const updateTeacherProfile = async (id, data) => {
  const res = await api.put(`/teacher/profile/${id}`, data);
  return res.data;
};