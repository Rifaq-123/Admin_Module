import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import FrontPage from "./pages/FrontPage";
import ProtectedRoute from "./ProtectedRoute";

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
  const [isAdminLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* 🌍 Landing */}
        <Route path="/" element={<FrontPage />} />

        {/* 🔐 Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 🔒 Protected Admin */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminSidebarLayout />}>
            <Route index element={<Navigate to="/admin/students/add" replace />} />

            {/* 🎓 Students */}
            <Route path="students/add" element={<AddStudent />} />
            <Route path="students/view" element={<ViewStudents />} />
            <Route path="students/edit" element={<EditStudent />} />
            <Route path="students/edit/:id/form" element={<EditStudentForm />} />
            <Route path="students/remove" element={<RemoveStudent />} />

            {/* 👨‍🏫 Teachers */}
            <Route path="teachers/add" element={<AddTeacher />} />
            <Route path="teachers/view" element={<ViewTeachers />} />
            <Route path="teachers/edit" element={<EditTeacher />} />
            <Route path="teachers/edit/:id/form" element={<EditTeacherForm />} />
            <Route path="teachers/remove" element={<RemoveTeacher />} />
          </Route>
        </Route>

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

