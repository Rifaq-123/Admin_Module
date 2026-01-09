import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FrontPage from "./pages/FrontPage";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AddStudent from "./pages/admin/AddStudent";
import ViewStudents from "./pages/admin/ViewStudents";
import EditStudent from "./pages/admin/EditStudent";
import EditStudentForm from "./pages/admin/EditStudentForm";
import RemoveStudent from "./pages/admin/RemoveStudent";
import AddTeacher from "./pages/admin/AddTeacher";
import ViewTeachers from "./pages/admin/ViewTeachers";
import EditTeacher from "./pages/admin/EditTeacher";
import EditTeacherForm from "./pages/admin/EditTeacherForm";
import RemoveTeacher from "./pages/admin/RemoveTeacher";

// Layout
import AdminSidebarLayout from "./layouts/AdminSidebarLayout";

// Student & Teacher
import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import TeacherRegister from "./pages/teacher/TeacherRegister";

function App() {
  const isAdminLoggedIn = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* 🌍 Landing Page */}
        <Route path="/" element={<FrontPage />} />

        {/* 🔐 Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 🧩 Admin Panel (with Sidebar) */}
        {isAdminLoggedIn ? (
          <Route path="/admin" element={<AdminSidebarLayout />}>
            {/* Default Route → Add Student */}
            <Route index element={<Navigate to="/admin/students/add" replace />} />

            {/* 🎓 Students */}
            <Route path="students/add" element={<AddStudent />} />
            <Route path="students/view" element={<ViewStudents />} />
            <Route path="students/edit" element={<EditStudent />} />
            <Route path="students/edit/:id/form" element={<EditStudentForm />} />
            <Route path="students/remove" element={<RemoveStudent />} />

<Route path="teachers/add" element={<AddTeacher />} />
<Route path="teachers/view" element={<ViewTeachers />} />
<Route path="teachers/edit" element={<EditTeacher />} />
<Route path="teachers/edit/:id/form" element={<EditTeacherForm />} />
<Route path="teachers/remove" element={<RemoveTeacher />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        )}

        {/* 🎓 Student */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />

        {/* 👨‍🏫 Teacher */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/register" element={<TeacherRegister />} />

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
