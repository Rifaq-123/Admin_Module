// api/teacherService.js
import api, { setAuthToken } from "./axiosInstance";

/* ===============================
   🔐 Teacher Login
================================ */
export const teacherLogin = async (credentials) => {
  const res = await api.post("/teacher/login", credentials);

  if (res.data?.token) {
    setAuthToken(res.data.token);
    localStorage.setItem("role", "TEACHER");
    localStorage.setItem("user", JSON.stringify({
      id: res.data.id,
      name: res.data.name,
      email: res.data.email,
      department: res.data.department
    }));
  }

  return res.data;
};

/* ===============================
   📊 Dashboard
================================ */
export const getTeacherDashboardStats = async (teacherId) => {
  if (!teacherId) throw new Error("Teacher ID is required");
  const res = await api.get(`/teacher/dashboard/stats/${teacherId}`);
  return res.data;
};

/* ===============================
   🎓 Students
================================ */
export const getStudentsPaginated = async (page = 0, size = 20) => {
  const res = await api.get(`/teacher/students?page=${page}&size=${size}`);
  return {
    content: res.data.content || [],
    currentPage: res.data.currentPage || 0,
    totalPages: res.data.totalPages || 0,
    totalItems: res.data.totalItems || res.data.totalElements || 0
  };
};

export const getAllStudents = async () => {
  const res = await api.get("/teacher/students/all");
  return Array.isArray(res.data) ? res.data : [];
};

export const getStudentByRollNo = async (rollNo) => {
  if (!rollNo) throw new Error("Roll number is required");
  const res = await api.get(`/teacher/students/roll/${rollNo}`);
  return res.data;
};

/* ===============================
   📋 Attendance
================================ */
export const markAttendance = async (attendanceData) => {
  const res = await api.post("/teacher/attendance", attendanceData);
  return res.data;
};

export const markBatchAttendance = async (teacherId, attendanceList) => {
  const res = await api.post("/teacher/attendance/batch", {
    teacherId,
    attendance: attendanceList
  });
  return res.data;
};

export const importAttendanceCSV = async (file, teacherId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("teacherId", teacherId.toString());

  const res = await api.post("/teacher/attendance/import", formData, {
    headers: { 
      "Content-Type": "multipart/form-data" 
    },
    timeout: 60000
  });
  
  return res.data;
};

export const getAttendanceByTeacher = async (teacherId, page = 0, size = 50) => {
  if (!teacherId) throw new Error("Teacher ID is required");
  
  const res = await api.get(
    `/teacher/attendance/teacher/${teacherId}?page=${page}&size=${size}`
  );
  
  return {
    content: res.data.content || [],
    currentPage: res.data.currentPage || 0,
    totalPages: res.data.totalPages || 0,
    totalItems: res.data.totalItems || res.data.totalElements || 0
  };
};

export const getAttendanceSummary = async (teacherId) => {
  if (!teacherId) throw new Error("Teacher ID is required");
  const res = await api.get(`/teacher/attendance/summary/${teacherId}`);
  return res.data;
};

export const getAttendanceByStudent = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/teacher/attendance/student/${studentId}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const updateAttendance = async (id, isPresent, remarks = "") => {
  const res = await api.put(`/teacher/attendance/${id}`, { isPresent, remarks });
  return res.data;
};

export const deleteAttendance = async (id) => {
  const res = await api.delete(`/teacher/attendance/${id}`);
  return res.data;
};

/* ===============================
   📝 Marks
================================ */
export const addMarks = async (marksData) => {
  const res = await api.post("/teacher/marks", marksData);
  return res.data;
};

export const updateMarks = async (id, marksData) => {
  const res = await api.put(`/teacher/marks/${id}`, marksData);
  return res.data;
};

export const getMarksByTeacher = async (teacherId, page = 0, size = 50) => {
  if (!teacherId) throw new Error("Teacher ID is required");
  
  const res = await api.get(
    `/teacher/marks/teacher/${teacherId}?page=${page}&size=${size}`
  );
  
  return {
    content: res.data.content || [],
    currentPage: res.data.currentPage || 0,
    totalPages: res.data.totalPages || 0,
    totalItems: res.data.totalItems || res.data.totalElements || 0
  };
};

export const getMarksByStudent = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/teacher/marks/student/${studentId}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const getAllMarks = async () => {
  const res = await api.get("/teacher/marks");
  return Array.isArray(res.data) ? res.data : [];
};

/* ===============================
   👤 Profile Management
================================ */
export const getTeacherProfile = async (teacherId) => {
  const res = await api.get(`/teacher/profile/${teacherId}`);
  return res.data;
};

export const updateTeacherProfile = async (teacherId, profileData) => {
  const res = await api.put(`/teacher/profile/${teacherId}`, profileData);
  return res.data;
};

export const changePassword = async (teacherId, currentPassword, newPassword) => {
  const res = await api.post(`/teacher/profile/${teacherId}/change-password`, {
    currentPassword,
    newPassword
  });
  return res.data;
};

/* ===============================
   📚 Study Materials - FIXED
================================ */

/**
 * ✅ Download material - proper implementation
 */
export const downloadMaterial = async (materialId, fileName) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081/api";
    const downloadUrl = `${baseUrl}/teacher/materials/${materialId}/download`;

    console.log("📥 Downloading from:", downloadUrl);

    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Download failed: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = fileName || 'download';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log("✅ Download completed:", fileName);
    return true;

  } catch (error) {
    console.error("❌ Download error:", error);
    throw error;
  }
};

export const uploadStudyMaterial = async (formData) => {
  const res = await api.post("/teacher/materials/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000
  });
  return res.data;
};

export const getMaterialsByTeacher = async (teacherId, page = 0, size = 20) => {
  const res = await api.get(`/teacher/materials/teacher/${teacherId}?page=${page}&size=${size}`);
  return res.data;
};

export const getMaterialById = async (materialId) => {
  const res = await api.get(`/teacher/materials/${materialId}`);
  return res.data;
};

export const updateMaterial = async (materialId, data) => {
  const res = await api.put(`/teacher/materials/${materialId}`, data);
  return res.data;
};

export const deleteMaterial = async (materialId, teacherId) => {
  const res = await api.delete(`/teacher/materials/${materialId}?teacherId=${teacherId}`);
  return res.data;
};

export const getMaterialStats = async (teacherId) => {
  const res = await api.get(`/teacher/materials/stats/${teacherId}`);
  return res.data;
};

export const getMaterialSubjects = async (teacherId) => {
  const res = await api.get(`/teacher/materials/subjects/${teacherId}`);
  return res.data;
};