import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { addTeacher } from "../../api/adminService";

function AddTeacher() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    qualification: "",
    experience: "",
    address: "",
    city: "",
    state: "",
    country: "",
    dateOfJoining: new Date().toISOString().split("T")[0],
    password: "teacher123",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTeacher(form);
      alert("✅ Teacher added successfully!");
      setForm({
        name: "",
        email: "",
        phone: "",
        department: "",
        specialization: "",
        qualification: "",
        experience: "",
        address: "",
        city: "",
        state: "",
        country: "",
        dateOfJoining: new Date().toISOString().split("T")[0],
        password: "teacher123",
      });
    } catch (err) {
      alert("❌ Failed to add teacher.");
      console.error(err);
    }
  };

  return (
    <Card className="shadow p-4" style={{ maxWidth: "900px", margin: "auto" }}>
      <h3 className="text-primary text-center mb-4">Add Teacher</h3>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} required />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control name="phone" value={form.phone} onChange={handleChange} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control name="department" value={form.department} onChange={handleChange} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Specialization</Form.Label>
              <Form.Control name="specialization" value={form.specialization} onChange={handleChange} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Qualification</Form.Label>
              <Form.Control name="qualification" value={form.qualification} onChange={handleChange} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Experience</Form.Label>
              <Form.Control name="experience" value={form.experience} onChange={handleChange} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Date of Joining</Form.Label>
              <Form.Control type="date" name="dateOfJoining" value={form.dateOfJoining} onChange={handleChange} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={form.password} onChange={handleChange} />
              <Form.Text className="text-muted">Default: teacher123</Form.Text>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control name="city" value={form.city} onChange={handleChange} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control name="state" value={form.state} onChange={handleChange} />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control name="country" value={form.country} onChange={handleChange} />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" rows={2} name="address" value={form.address} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" className="w-100">
          ➕ Add Teacher
        </Button>
      </Form>
    </Card>
  );
}

export default AddTeacher;
