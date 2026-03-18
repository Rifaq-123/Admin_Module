import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  GraduationCap,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { logout } from "../api/axiosInstance";
import "../styles/AdminStyles.css";

const AdminSidebarLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                  <div className="brand-icon">A</div>
                  <div className="brand-text">
                    <h4>Admin Panel</h4>
                    <small>Student Management</small>
                  </div>
                </div>
                {/* Close button for mobile */}
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
                  to="/admin/dashboard"
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
                  to="/admin/students/view"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Users className="sidebar-link-icon" size={20} />
                  <span>View Students</span>
                </NavLink>

                <NavLink
                  to="/admin/students/add"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <UserPlus className="sidebar-link-icon" size={20} />
                  <span>Add Student</span>
                </NavLink>

                <NavLink
                  to="/admin/students/edit"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <UserCheck className="sidebar-link-icon" size={20} />
                  <span>Update Student</span>
                </NavLink>

                <NavLink
                  to="/admin/students/remove"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <UserX className="sidebar-link-icon" size={20} />
                  <span>Delete Student</span>
                </NavLink>
              </div>

              {/* Teachers */}
              <div className="sidebar-section">
                <div className="section-label">Teachers</div>

                <NavLink
                  to="/admin/teachers/view"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <GraduationCap className="sidebar-link-icon" size={20} />
                  <span>View Teachers</span>
                </NavLink>

                <NavLink
                  to="/admin/teachers/add"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <UserPlus className="sidebar-link-icon" size={20} />
                  <span>Add Teacher</span>
                </NavLink>

                <NavLink
                  to="/admin/teachers/edit"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <UserCheck className="sidebar-link-icon" size={20} />
                  <span>Update Teacher</span>
                </NavLink>

                <NavLink
                  to="/admin/teachers/remove"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <UserX className="sidebar-link-icon" size={20} />
                  <span>Delete Teacher</span>
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
          {/* Mobile Menu Toggle Button */}
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

export default AdminSidebarLayout;