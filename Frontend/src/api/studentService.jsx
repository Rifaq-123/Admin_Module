import api from "./axiosInstance";

export const getMyMarks = async (id) => {
  const res = await api.get(`/student/marks/${id}`);
  return res.data;
};

export const getMyAttendance = async (id) => {
  const res = await api.get(`/student/attendance/${id}`);
  return res.data;
};

export const getMyProfile = async (id) => {
  const res = await api.get(`/student/profile/${id}`);
  return res.data;
};

export const updateMyProfile = async (id, data) => {
  const res = await api.put(`/student/profile/${id}`, data);
  return res.data;
};