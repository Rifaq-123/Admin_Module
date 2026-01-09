import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";

const AdminSidebarLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Sidebar */}
        <Col
          md={2}
          className="bg-dark text-light vh-100 d-flex flex-column justify-content-between p-3"
        >
          {/* --- Top Nav --- */}
          <div>
            <h4 className="mb-4 text-center text-info fw-bold">Admin Panel</h4>

            <nav className="nav flex-column">
              {/* --- Students --- */}
              <span className="text-secondary small fw-bold mb-2">🎓 Students</span>
              <NavLink to="/admin/students/add" className="nav-link text-light">
                ➕ Add Student
              </NavLink>
              <NavLink to="/admin/students/view" className="nav-link text-light">
                📋 View Students
              </NavLink>
              <NavLink to="/admin/students/edit" className="nav-link text-light">
                ✏️ Edit Students
              </NavLink>
              <NavLink to="/admin/students/remove" className="nav-link text-light">
                ❌ Remove Students
              </NavLink>

              <hr className="text-secondary" />

              {/* --- Teachers --- */}
              <span className="text-secondary small fw-bold mb-2">👩‍🏫 Teachers</span>
              <NavLink to="/admin/teachers/add" className="nav-link text-light">
                ➕ Add Teacher
              </NavLink>
              <NavLink to="/admin/teachers/view" className="nav-link text-light">
                📋 View Teachers
              </NavLink>
              <NavLink to="/admin/teachers/edit" className="nav-link text-light">
                ✏️ Edit Teachers
              </NavLink>
              <NavLink to="/admin/teachers/remove" className="nav-link text-light">
                ❌ Remove Teachers
              </NavLink>
            </nav>
          </div>

          {/* --- Bottom Logout --- */}
          <div className="text-center mt-auto">
            <Button
              variant="outline-light"
              className="w-100 fw-semibold logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={10} className="p-4" style={{ backgroundColor: "#f8f9fa" }}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminSidebarLayout;
