import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck,
  BookOpen,
  Eye,
  LogOut,
  Menu,
  X,
  UserCircle,
  FileText
} from "lucide-react";
import { logout } from "../api/axiosInstance";
import "../styles/AdminStyles.css";

const TeacherSidebarLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Mobile Overlay */}
        <div 
          className={`mobile-sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        ></div>

        {/* Sidebar */}
        <Col md={2} className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="d-flex flex-column h-100">
            {/* Header */}
            <div className="sidebar-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="sidebar-brand">
                  <div className="brand-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                    T
                  </div>
                  <div className="brand-text">
                    <h4>Teacher Panel</h4>
                    <small>{user.name || "Teacher"}</small>
                  </div>
                </div>
                <button 
                  className="btn btn-link text-white d-md-none p-0"
                  onClick={closeMobileMenu}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow-1">
              {/* Dashboard */}
              <div className="sidebar-section">
                <NavLink
                  to="/teacher/dashboard"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <LayoutDashboard className="sidebar-link-icon" size={20} />
                  <span>Dashboard</span>
                </NavLink>
              </div>

              {/* Students */}
              <div className="sidebar-section">
                <div className="section-label">Students</div>
                
                <NavLink
                  to="/teacher/students"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Users className="sidebar-link-icon" size={20} />
                  <span>View Students</span>
                </NavLink>
              </div>

              {/* Attendance */}
              <div className="sidebar-section">
                <div className="section-label">Attendance</div>

                <NavLink
                  to="/teacher/attendance/mark"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <ClipboardCheck className="sidebar-link-icon" size={20} />
                  <span>Mark Attendance</span>
                </NavLink>

                <NavLink
                  to="/teacher/attendance/view"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Eye className="sidebar-link-icon" size={20} />
                  <span>View Attendance</span>
                </NavLink>
              </div>

              {/* Marks */}
              <div className="sidebar-section">
                <div className="section-label">Marks</div>

                <NavLink
                  to="/teacher/marks/add"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <BookOpen className="sidebar-link-icon" size={20} />
                  <span>Add Marks</span>
                </NavLink>

                <NavLink
                  to="/teacher/marks/view"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Eye className="sidebar-link-icon" size={20} />
                  <span>View Marks</span>
                </NavLink>
              </div>

              {/* Study Materials */}
              <div className="sidebar-section">
                <div className="section-label">Resources</div>

                <NavLink
                  to="/teacher/materials"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <FileText className="sidebar-link-icon" size={20} />
                  <span>Study Materials</span>
                </NavLink>
              </div>

              {/* Profile */}
              <div className="sidebar-section">
                <div className="section-label">Profile</div>

                <NavLink
                  to="/teacher/profile"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <UserCircle className="sidebar-link-icon" size={20} />
                  <span>Profile</span>
                </NavLink>
              </div>
            </nav>

            {/* Logout */}
            <Button className="logout-btn" onClick={logout}>
              <LogOut size={18} className="me-2" />
              Logout
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={10} className="admin-content">
          <button 
            className="mobile-sidebar-toggle d-md-none"
            onClick={toggleMobileMenu}
          >
            <Menu size={24} />
          </button>

          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherSidebarLayout;