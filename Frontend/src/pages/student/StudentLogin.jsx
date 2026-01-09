import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { studentLogin } from "../../api/studentService";
import { useNavigate } from "react-router-dom";

function StudentLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await studentLogin(form);
      localStorage.setItem("student", JSON.stringify(res.data));
      alert("Login successful!");
      navigate("/student/dashboard");
    } catch (error) {
      alert("Invalid email or password.");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-4 text-success">Student Login</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Form.Group>

        <Button variant="success" type="submit" className="w-100">
          Login
        </Button>
      </Form>
    </Container>
  );
}

export default StudentLogin;
