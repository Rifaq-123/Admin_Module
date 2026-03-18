// api/studentService.js - COMPLETE VERSION
import api, { setAuthToken } from "./axiosInstance";

/* ===============================
   🔐 Student Login
================================ */
export const studentLogin = async (credentials) => {
  const res = await api.post("/student/login", credentials);

  if (res.data?.token) {
    setAuthToken(res.data.token);
    localStorage.setItem("role", "STUDENT");
    localStorage.setItem("user", JSON.stringify({
      id: res.data.id,
      name: res.data.name,
      email: res.data.email,
      rollNo: res.data.rollNo,
      department: res.data.department,
      course: res.data.course
    }));
  }

  return res.data;
};

/* ===============================
   📊 Dashboard
================================ */
export const getStudentDashboardStats = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/dashboard/stats/${studentId}`);
  return res.data;
};

/* ===============================
   📝 Marks
================================ */
export const getMyMarks = async (studentId, page = 0, size = 50) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/marks/${studentId}?page=${page}&size=${size}`);
  
  return {
    content: res.data.content || [],
    currentPage: res.data.currentPage || 0,
    totalPages: res.data.totalPages || 0,
    totalItems: res.data.totalItems || res.data.totalElements || 0
  };
};

export const getMarksBySemester = async (studentId, semester) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/marks/${studentId}/semester/${semester}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const getMarksSummary = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/marks/${studentId}/summary`);
  return res.data;
};

/* ===============================
   📋 Attendance
================================ */
export const getMyAttendance = async (studentId, page = 0, size = 50) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/attendance/${studentId}?page=${page}&size=${size}`);
  
  return {
    content: res.data.content || [],
    currentPage: res.data.currentPage || 0,
    totalPages: res.data.totalPages || 0,
    totalItems: res.data.totalItems || res.data.totalElements || 0
  };
};

export const getAttendanceSummary = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/attendance/${studentId}/summary`);
  return res.data;
};

export const getAttendanceBySubject = async (studentId, subject) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/attendance/${studentId}/subject/${subject}`);
  return Array.isArray(res.data) ? res.data : [];
};

/* ===============================
   🎯 CGPA & Performance
================================ */
export const getCurrentCGPA = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/cgpa/current/${studentId}`);
  return res.data;
};

export const predictCGPA = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/cgpa/predict/${studentId}`);
  return res.data;
};

export const getPerformanceAnalytics = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/performance/${studentId}`);
  return res.data;
};

export const getPerformanceTrends = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/performance/${studentId}/trends`);
  return res.data;
};

/* ===============================
   📚 Study Materials
================================ */
export const getAllStudyMaterials = async (page = 0, size = 20) => {
  const res = await api.get(`/student/materials?page=${page}&size=${size}`);
  
  return {
    content: res.data.content || [],
    currentPage: res.data.currentPage || 0,
    totalPages: res.data.totalPages || 0,
    totalItems: res.data.totalItems || res.data.totalElements || 0
  };
};

export const getStudyMaterialsBySubject = async (subject) => {
  const res = await api.get(`/student/materials/subject/${subject}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const searchStudyMaterials = async (query) => {
  const res = await api.get(`/student/materials/search?query=${encodeURIComponent(query)}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const getStudyMaterialById = async (materialId) => {
  const res = await api.get(`/student/materials/${materialId}`);
  return res.data;
};

export const downloadStudyMaterial = async (materialId, fileName) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081/api";
    const downloadUrl = `${baseUrl}/student/materials/${materialId}/download`;

    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
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

    return true;

  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
};

/* ===============================
   📄 Reports
================================ */
export const downloadAcademicReport = async (studentId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081/api";
    const downloadUrl = `${baseUrl}/student/reports/academic/${studentId}`;

    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = `Academic_Report_${studentId}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    return true;

  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
};

export const downloadAttendanceReport = async (studentId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081/api";
    const downloadUrl = `${baseUrl}/student/reports/attendance/${studentId}`;

    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = `Attendance_Report_${studentId}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    return true;

  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
};

/* ===============================
   👤 Profile
================================ */
export const getMyProfile = async (studentId) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.get(`/student/profile/${studentId}`);
  return res.data;
};

export const updateMyProfile = async (studentId, profileData) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.put(`/student/profile/${studentId}`, profileData);
  return res.data;
};

export const changePassword = async (studentId, currentPassword, newPassword) => {
  if (!studentId) throw new Error("Student ID is required");
  const res = await api.post(`/student/profile/${studentId}/change-password`, {
    currentPassword,
    newPassword
  });
  return res.data;
};