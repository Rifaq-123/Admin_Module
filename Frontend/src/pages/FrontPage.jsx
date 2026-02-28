import React from "react";
import { Container, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function FrontPage() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Admin Portal",
      description: "Manage students, teachers, and system operations.",
      path: "/admin/login",
      variant: "primary",
    },
    {
      title: "Teacher Portal",
      description: "Manage student marks and attendance records.",
      path: "/teacher/login",
      variant: "info",
    },
    {
      title: "Student Portal",
      description: "View your profile, marks, attendance, and CGPA.",
      path: "/student/login",
      variant: "success",
    },
  ];

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <h1 className="mb-3 text-primary fw-bold text-center">
        Cloud Based Student Management System
      </h1>

      <p className="text-muted mb-5 text-center">
        Secure • Role-Based • Academic Management Platform
      </p>

      <div className="d-flex flex-wrap justify-content-center gap-4">
        {roles.map((role, index) => (
          <Card
            key={index}
            style={{ width: "18rem" }}
            className="shadow-sm border-0 hover-card"
          >
            <Card.Body className="text-center">
              <Card.Title className="fw-semibold">
                {role.title}
              </Card.Title>

              <Card.Text>{role.description}</Card.Text>

              <Button
                variant={role.variant}
                onClick={() => navigate(role.path)}
              >
                Login
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
}

export default FrontPage;