import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { 
  LayoutDashboard, 
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  FileText,
  UserCircle,
  LogOut,
  Menu,
  X,
  Download
} from "lucide-react";
import { logout } from "../api/axiosInstance";
import "../styles/AdminStyles.css";

const StudentSidebarLayout = () => {
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
                  <div className="brand-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                    S
                  </div>
                  <div className="brand-text">
                    <h4>Student Portal</h4>
                    <small>{user.name || "Student"}</small>
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
                  to="/student/dashboard"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <LayoutDashboard className="sidebar-link-icon" size={20} />
                  <span>Dashboard</span>
                </NavLink>
              </div>

              {/* Academic */}
              <div className="sidebar-section">
                <div className="section-label">Academic</div>
                
                <NavLink
                  to="/student/marks"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <BookOpen className="sidebar-link-icon" size={20} />
                  <span>My Marks</span>
                </NavLink>

                <NavLink
                  to="/student/attendance"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <ClipboardCheck className="sidebar-link-icon" size={20} />
                  <span>My Attendance</span>
                </NavLink>

                <NavLink
                  to="/student/cgpa"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <TrendingUp className="sidebar-link-icon" size={20} />
                  <span>CGPA & Analytics</span>
                </NavLink>
              </div>

              {/* Resources */}
              <div className="sidebar-section">
                <div className="section-label">Resources</div>

                <NavLink
                  to="/student/materials"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <FileText className="sidebar-link-icon" size={20} />
                  <span>Study Materials</span>
                </NavLink>

                <NavLink
                  to="/student/reports"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Download className="sidebar-link-icon" size={20} />
                  <span>Reports</span>
                </NavLink>
              </div>

              {/* Profile */}
              <div className="sidebar-section">
                <div className="section-label">Profile</div>

                <NavLink
                  to="/student/profile"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <UserCircle className="sidebar-link-icon" size={20} />
                  <span>My Profile</span>
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

export default StudentSidebarLayout;