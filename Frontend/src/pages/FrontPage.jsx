import React from "react";
import { Container, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function FrontPage() {
  const navigate = useNavigate();

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-4 text-primary fw-bold text-center">
        Cloud Based Student Management System
      </h1>

      <div className="d-flex flex-wrap justify-content-center gap-4">
        <Card style={{ width: "16rem" }} className="shadow">
          <Card.Body className="text-center">
            <Card.Title>Admin</Card.Title>
            <Card.Text>
              Manage students, teachers, and approve registrations.
            </Card.Text>
            <Button variant="primary" onClick={() => navigate("/admin/login")}>
              Admin Login
            </Button>
          </Card.Body>
        </Card>

        <Card style={{ width: "16rem" }} className="shadow">
          <Card.Body className="text-center">
            <Card.Title>Teacher</Card.Title>
            <Card.Text>
              Manage marks and attendance of students.
            </Card.Text>
            <div className="d-flex justify-content-center gap-2">
              <Button variant="info" onClick={() => navigate("/teacher/login")}>
                Login
              </Button>
              <Button variant="outline-info" onClick={() => navigate("/teacher/register")}>
                Register
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card style={{ width: "16rem" }} className="shadow">
          <Card.Body className="text-center">
            <Card.Title>Student</Card.Title>
            <Card.Text>
              View your profile, marks, and attendance.
            </Card.Text>
            <div className="d-flex justify-content-center gap-2">
              <Button variant="success" onClick={() => navigate("/student/login")}>
                Login
              </Button>
              <Button variant="outline-success" onClick={() => navigate("/student/register")}>
                Register
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default FrontPage;
