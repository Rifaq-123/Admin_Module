// src/Pages/admin/AddTeacher.jsx

import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { addTeacher } from "../../api/adminService";

function AddTeacher() {
  const initialState = {
    name: "",
    email: "",
    phone: "",
    department: "",
    subject: "",
    specialization: "",
    qualification: "",
    experience: 0,
    address: "",
    city: "",
    state: "",
    country: "",
    dateOfJoining: "",
    password: "teacher123",
  };

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setSuccess(null);
  setError(null);

  try {
    const cleanedForm = {
      ...form,
      experience: form.experience
        ? Number(form.experience)
        : null,
      dateOfJoining: form.dateOfJoining || null
    };

    await addTeacher(cleanedForm);

    setSuccess("Teacher added successfully!");
    setForm(initialState);
  } catch (err) {
    setError(err || "Failed to add teacher");
  } finally {
    setLoading(false);
  }
};

  return (
    <Card
      className="shadow-sm border-0 p-4"
      style={{ maxWidth: "900px", margin: "auto" }}
    >
      <h3 className="text-primary text-center mb-4 fw-bold">
        Add Teacher
      </h3>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

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
              <Form.Label>Subject</Form.Label>
              <Form.Control
                name="subject"
                value={form.subject}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Specialization</Form.Label>
              <Form.Control
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Qualification</Form.Label>
              <Form.Control
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Experience (Years)</Form.Label>
              <Form.Control
                type="number"
                name="experience"
                value={form.experience}
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
                Default: teacher123
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
            <Form.Group className="mb-4">
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

        <Button
          variant="primary"
          type="submit"
          className="w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Adding...
            </>
          ) : (
            "➕ Add Teacher"
          )}
        </Button>
      </Form>
    </Card>
  );
}

export default AddTeacher;