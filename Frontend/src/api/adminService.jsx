// api/adminService.js
import api, { setAuthToken } from "./axiosInstance";

/* ===============================
   🔐 Admin Login
================================ */
export const adminLogin = async (credentials) => {
  const res = await api.post("/admin/login", credentials);

  if (res.data?.token) {
    setAuthToken(res.data.token);
    localStorage.setItem("role", "ADMIN");
    localStorage.setItem("user", JSON.stringify(res.data));
  }

  return res.data;
};

/* ===============================
   📊 Dashboard Stats
================================ */
export const getDashboardStats = async () => {
  const res = await api.get("/admin/dashboard/stats");
  return res.data;
};

/* ===============================
   🧑‍🎓 Student Management
================================ */

/**
 * Get paginated students (for list views)
 */
export const getStudentsPaginated = async (
  page = 0, 
  size = 20, 
  sortBy = "id", 
  sortDir = "desc", 
  search = ""
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir
  });
  
  if (search && search.trim()) {
    params.append("search", search.trim());
  }

  const res = await api.get(`/admin/students?${params}`);
  
  // Ensure consistent response format
  return {
    content: res.data.content || [],
    currentPage: res.data.currentPage || 0,
    totalPages: res.data.totalPages || 0,
    totalItems: res.data.totalItems || res.data.totalElements || 0,
    hasNext: res.data.hasNext || false,
    hasPrevious: res.data.hasPrevious || false
  };
};

/**
 * Get all students (for dropdowns, selects)
 */
export const getAllStudents = async () => {
  const res = await api.get("/admin/students/all");
  // Backend returns simple array from /all endpoint
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Get student by ID
 */
export const getStudentById = async (id) => {
  const res = await api.get(`/admin/students/${id}`);
  return res.data;
};

/**
 * Get student by Roll Number
 */
export const getStudentByRollNo = async (rollNo) => {
  const res = await api.get(`/admin/students/roll/${rollNo}`);
  return res.data;
};

/**
 * Add new student
 */
export const addStudent = async (data) => {
  const res = await api.post("/admin/students", data);
  return res.data;
};

/**
 * Update student
 */
export const updateStudent = async (id, data) => {
  const res = await api.put(`/admin/students/${id}`, data);
  return res.data;
};

/**
 * Delete student
 */
export const deleteStudent = async (id) => {
  const res = await api.delete(`/admin/students/${id}`);
  return res.data;
};

/* ===============================
   👩‍🏫 Teacher Management
================================ */

/**
 * Get paginated teachers (for list views)
 */
export const getTeachersPaginated = async (
  page = 0, 
  size = 20, 
  sortBy = "id", 
  sortDir = "desc"
) => {
  const res = await api.get(
    `/admin/teachers?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
  );
  
  // Ensure consistent response format
  return {
    content: res.data.content || [],
    currentPage: res.data.currentPage || 0,
    totalPages: res.data.totalPages || 0,
    totalItems: res.data.totalItems || res.data.totalElements || 0,
    hasNext: res.data.hasNext || false,
    hasPrevious: res.data.hasPrevious || false
  };
};

/**
 * Get all teachers (for dropdowns, selects)
 */
export const getAllTeachers = async () => {
  const res = await api.get("/admin/teachers/all");
  // Backend returns simple array from /all endpoint
  return Array.isArray(res.data) ? res.data : [];
};

/**
 * Get teacher by ID
 */
export const getTeacherById = async (id) => {
  const res = await api.get(`/admin/teachers/${id}`);
  return res.data;
};

/**
 * Add new teacher
 */
export const addTeacher = async (data) => {
  const res = await api.post("/admin/teachers", data);
  return res.data;
};

/**
 * Update teacher
 */
export const updateTeacher = async (id, data) => {
  const res = await api.put(`/admin/teachers/${id}`, data);
  return res.data;
};

/**
 * Delete teacher
 */
export const deleteTeacher = async (id) => {
  const res = await api.delete(`/admin/teachers/${id}`);
  return res.data;
};

// Aliases for backward compatibility
export const getStudents = getAllStudents;
export const getTeachers = getAllTeachers;