import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { addStudent } from "../../api/adminService";

function AddStudent() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    course: "",
    address: "",
    city: "",
    state: "",
    country: "",
    dateOfJoining: "", // ✅ no auto date
    password: "student123", // ✅ still default
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addStudent(form);
      alert("✅ Student added successfully!");
      setForm({
        name: "",
        email: "",
        phone: "",
        department: "",
        course: "",
        address: "",
        city: "",
        state: "",
        country: "",
        dateOfJoining: "",
        password: "student123",
      });
    } catch (err) {
      console.error("❌ Failed to add student:", err);
      alert("❌ Failed to add student.");
    }
  };

  return (
    <Card className="shadow p-4" style={{ maxWidth: "900px", margin: "auto" }}>
      <h3 className="text-primary text-center mb-4">Add Student</h3>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
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
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Course</Form.Label>
              <Form.Control
                name="course"
                value={form.course}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Date of Joining</Form.Label>
              <Form.Control
                type="date"
                name="dateOfJoining"
                value={form.dateOfJoining}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Default: student123
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                name="state"
                value={form.state}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                name="country"
                value={form.country}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" className="w-100">
          ➕ Add Student
        </Button>
      </Form>
    </Card>
  );
}

export default AddStudent;
