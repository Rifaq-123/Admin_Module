import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import FrontPage from "./pages/FrontPage";
import ProtectedRoute from "./ProtectedRoute";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AddStudent from "./pages/admin/AddStudent";
import ViewStudents from "./pages/admin/ViewStudents";
import EditStudent from "./pages/admin/EditStudent";
import RemoveStudent from "./pages/admin/RemoveStudent";
import AddTeacher from "./pages/admin/AddTeacher";
import ViewTeachers from "./pages/admin/ViewTeachers";
import EditTeacher from "./pages/admin/EditTeacher";
import RemoveTeacher from "./pages/admin/RemoveTeacher";

// Layout
import AdminSidebarLayout from "./layouts/AdminSidebarLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🌍 Landing */}
        <Route path="/" element={<FrontPage />} />

        {/* 🔐 Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 🔒 Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminSidebarLayout />}>

            <Route index element={<Navigate to="students/add" replace />} />

            {/* 🎓 Students */}
            <Route path="students/add" element={<AddStudent />} />
            <Route path="students/view" element={<ViewStudents />} />
            <Route path="students/edit" element={<EditStudent />} />
            <Route path="students/remove" element={<RemoveStudent />} />

            {/* 👨‍🏫 Teachers */}
            <Route path="teachers/add" element={<AddTeacher />} />
            <Route path="teachers/view" element={<ViewTeachers />} />
            <Route path="teachers/edit" element={<EditTeacher />} />
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