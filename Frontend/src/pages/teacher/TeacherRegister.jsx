import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { teacherRegister } from "../../api/teacherService";
import { useNavigate } from "react-router-dom";

function TeacherRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    course: "",
    otp: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await teacherRegister(form);
      alert("Teacher registered successfully! Awaiting verification.");
      navigate("/teacher/login");
    } catch (error) {
      alert("Registration failed. Please check your details or OTP.");
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "500px" }}>
      <h3 className="text-center mb-4 text-primary">Teacher Registration</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Department</Form.Label>
          <Form.Control
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Course</Form.Label>
          <Form.Control
            name="course"
            value={form.course}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>OTP (Provided by Admin)</Form.Label>
          <Form.Control
            name="otp"
            value={form.otp}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Register
        </Button>
      </Form>
    </Container>
  );
}

export default TeacherRegister;
