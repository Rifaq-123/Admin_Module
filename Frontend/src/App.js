// App.jsx - COMPLETE VERSION WITH STUDENT ROUTES
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context
import { AuthProvider } from "./context/AuthContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingFallback from "./components/LoadingFallback";

// Styles
import "./styles/AdminStyles.css";

// ✅ LAZY LOADED PAGES
const FrontPage = lazy(() => import("./pages/FrontPage"));

// Admin
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminSidebarLayout = lazy(() => import("./layouts/AdminSidebarLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AddStudent = lazy(() => import("./pages/admin/AddStudent"));
const ViewStudents = lazy(() => import("./pages/admin/ViewStudents"));
const EditStudent = lazy(() => import("./pages/admin/EditStudent"));
const RemoveStudent = lazy(() => import("./pages/admin/RemoveStudent"));
const AddTeacher = lazy(() => import("./pages/admin/AddTeacher"));
const ViewTeachers = lazy(() => import("./pages/admin/ViewTeachers"));
const EditTeacher = lazy(() => import("./pages/admin/EditTeacher"));
const RemoveTeacher = lazy(() => import("./pages/admin/RemoveTeacher"));

// Teacher
const TeacherLogin = lazy(() => import("./pages/teacher/TeacherLogin"));
const TeacherSidebarLayout = lazy(() => import("./layouts/TeacherSidebarLayout"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const TeacherViewStudents = lazy(() => import("./pages/teacher/ViewStudents"));
const MarkAttendance = lazy(() => import("./pages/teacher/MarkAttendance"));
const ViewAttendance = lazy(() => import("./pages/teacher/ViewAttendance"));
const AddMarks = lazy(() => import("./pages/teacher/AddMarks"));
const ViewMarks = lazy(() => import("./pages/teacher/ViewMarks"));
const TeacherProfile = lazy(() => import("./pages/teacher/TeacherProfile"));
const StudyMaterials = lazy(() => import("./pages/teacher/StudyMaterials"));

// ✅ NEW: Student
const StudentLogin = lazy(() => import("./pages/student/StudentLogin"));
const StudentSidebarLayout = lazy(() => import("./layouts/StudentSidebarLayout"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentMarks = lazy(() => import("./pages/student/StudentMarks"));
const StudentAttendance = lazy(() => import("./pages/student/StudentAttendance"));
const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));
const CGPAPrediction = lazy(() => import("./pages/student/CGPAPrediction"));
const StudyMaterialsView = lazy(() => import("./pages/student/StudyMaterialsView"));
const AcademicReports = lazy(() => import("./pages/student/AcademicReports"));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* ===================================
                  PUBLIC ROUTES
              =================================== */}
              <Route path="/" element={<FrontPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/teacher/login" element={<TeacherLogin />} />
              <Route path="/student/login" element={<StudentLogin />} />

              {/* ===================================
                  PROTECTED ADMIN ROUTES
              =================================== */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminSidebarLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students/add" element={<AddStudent />} />
                <Route path="students/view" element={<ViewStudents />} />
                <Route path="students/edit" element={<EditStudent />} />
                <Route path="students/remove" element={<RemoveStudent />} />
                <Route path="teachers/add" element={<AddTeacher />} />
                <Route path="teachers/view" element={<ViewTeachers />} />
                <Route path="teachers/edit" element={<EditTeacher />} />
                <Route path="teachers/remove" element={<RemoveTeacher />} />
              </Route>

              {/* ===================================
                  PROTECTED TEACHER ROUTES
              =================================== */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRole="TEACHER">
                    <TeacherSidebarLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="students" element={<TeacherViewStudents />} />
                <Route path="attendance/mark" element={<MarkAttendance />} />
                <Route path="attendance/view" element={<ViewAttendance />} />
                <Route path="marks/add" element={<AddMarks />} />
                <Route path="marks/view" element={<ViewMarks />} />
                <Route path="materials" element={<StudyMaterials />} />
                <Route path="profile" element={<TeacherProfile />} />
              </Route>

              {/* ===================================
                  ✅ NEW: PROTECTED STUDENT ROUTES
              =================================== */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRole="STUDENT">
                    <StudentSidebarLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="marks" element={<StudentMarks />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="cgpa" element={<CGPAPrediction />} />
                <Route path="materials" element={<StudyMaterialsView />} />
                <Route path="reports" element={<AcademicReports />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>

              {/* ===================================
                  FALLBACK - Redirect to Home
              =================================== */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="light"
          />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;