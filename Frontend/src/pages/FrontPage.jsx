// pages/FrontPage.jsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Shield, BookOpen, GraduationCap, ArrowRight } from "lucide-react";

function FrontPage() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Admin Portal",
      description: "Manage students, teachers, and system operations.",
      path: "/admin/login",
      icon: Shield,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Teacher Portal",
      description: "Manage student marks and attendance records.",
      path: "/teacher/login",
      icon: BookOpen,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
    {
      title: "Student Portal",
      description: "View your profile, marks, attendance, and CGPA.",
      path: "/student/login",
      icon: GraduationCap,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
  ];

  return (
    <div 
      className="min-vh-100 d-flex align-items-center"
      style={{ 
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" 
      }}
    >
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold mb-3" style={{ color: "#1e293b" }}>
            Cloud Based Student Management System
          </h1>
          <p className="lead text-muted">
            Secure • Role-Based • Academic Management Platform
          </p>
        </div>

        <Row className="justify-content-center g-4">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <Col key={index} xs={12} md={6} lg={4}>
                <Card 
                  className="h-100 border-0 shadow-sm hover-card"
                  style={{ 
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onClick={() => navigate(role.path)}
                >
                  <Card.Body className="p-4 text-center">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                      style={{ 
                        width: "80px", 
                        height: "80px",
                        background: role.gradient
                      }}
                    >
                      <IconComponent size={36} className="text-white" />
                    </div>
                    
                    <Card.Title className="fw-bold mb-3">
                      {role.title}
                    </Card.Title>
                    
                    <Card.Text className="text-muted mb-4">
                      {role.description}
                    </Card.Text>

                    <Button
                      className="d-flex align-items-center justify-content-center gap-2 w-100"
                      style={{ 
                        background: role.gradient,
                        border: "none"
                      }}
                    >
                      Login
                      <ArrowRight size={18} />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        <p className="text-center text-muted mt-5 small">
          © {new Date().getFullYear()} Student Management System. All rights reserved.
        </p>
      </Container>
    </div>
  );
}

export default FrontPage;