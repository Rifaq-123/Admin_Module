import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllTeachers, updateTeacher } from "../../api/adminService";
import { Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";

function EditTeacherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTeacher = async () => {
    try {
      const all = await getAllTeachers();
      const found = all.find((t) => t.id === parseInt(id));
      setTeacher(found);
    } catch (err) {
      console.error("❌ Failed to load teacher", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacher();
  }, []);

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTeacher(id, teacher);
      alert("✅ Teacher updated successfully!");
      navigate("/admin/teachers/view");
    } catch (err) {
      alert("❌ Failed to update teacher");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (!teacher)
    return <p className="text-center text-danger">Teacher not found.</p>;

  return (
    <Card className="shadow-sm p-4" style={{ maxWidth: "900px", margin: "auto" }}>
      <h3 className="text-primary text-center mb-4">Edit Teacher</h3>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={teacher.name}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={teacher.email}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={teacher.phone}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                name="department"
                value={teacher.department}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Specialization</Form.Label>
              <Form.Control
                type="text"
                name="specialization"
                value={teacher.specialization}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Qualification</Form.Label>
              <Form.Control
                type="text"
                name="qualification"
                value={teacher.qualification}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Experience</Form.Label>
              <Form.Control
                type="text"
                name="experience"
                value={teacher.experience}
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
                value={teacher.dateOfJoining}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={teacher.password}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={teacher.city}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                name="country"
                value={teacher.country}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" className="w-100 mt-3">
          Update Teacher
        </Button>
      </Form>
    </Card>
  );
}

export default EditTeacherForm;
