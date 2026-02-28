// src/Pages/admin/AdminSidebarLayout.jsx

import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { logout } from ".././api/axiosInstance";

const AdminSidebarLayout = () => {
  return (
    <Container fluid className="p-0">
      <Row className="g-0 min-vh-100">

        {/* Sidebar */}
        <Col
          md={2}
          className="bg-dark text-light d-flex flex-column p-3"
        >
          <div>
            <h4 className="mb-4 text-center text-info fw-bold">
              Admin Panel
            </h4>

            <nav className="nav flex-column">

              {/* ===== Students Section ===== */}
              <span className="text-secondary small fw-bold mb-2">
                🎓 Students
              </span>

              <NavLink
                to="/admin/students/add"
                className="nav-link text-light"
              >
                ➕ Add Student
              </NavLink>

              <NavLink
                to="/admin/students/view"
                className="nav-link text-light"
              >
                📋 View Students
              </NavLink>

              <NavLink
                to="/admin/students/edit"
                className="nav-link text-light"
              >
                ✏️ Update Student
              </NavLink>

              <NavLink
                to="/admin/students/remove"
                className="nav-link text-light"
              >
                ❌ Delete Student
              </NavLink>

              <hr className="text-secondary" />

              {/* ===== Teachers Section ===== */}
              <span className="text-secondary small fw-bold mb-2">
                👩‍🏫 Teachers
              </span>

              <NavLink
                to="/admin/teachers/add"
                className="nav-link text-light"
              >
                ➕ Add Teacher
              </NavLink>

              <NavLink
                to="/admin/teachers/view"
                className="nav-link text-light"
              >
                📋 View Teachers
              </NavLink>

              <NavLink
                to="/admin/teachers/edit"
                className="nav-link text-light"
              >
                ✏️ Update Teacher
              </NavLink>

              <NavLink
                to="/admin/teachers/remove"
                className="nav-link text-light"
              >
                ❌ Delete Teacher
              </NavLink>

            </nav>
          </div>

          {/* Logout Button */}
          <div className="mt-auto">
            <Button
              variant="outline-light"
              className="w-100 fw-semibold logout-btn"
              onClick={logout}
            >
              🚪 Logout
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={10} className="p-4 bg-light">
          <Outlet />
        </Col>

      </Row>
    </Container>
  );
};

export default AdminSidebarLayout;