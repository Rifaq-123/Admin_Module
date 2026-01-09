import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllStudents, updateStudent } from "../../api/adminService";
import { Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";

function EditStudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStudent = async () => {
    try {
      const all = await getAllStudents();
      const found = all.find((s) => s.id === parseInt(id));
      setStudent(found);
    } catch (err) {
      console.error("❌ Failed to load student", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateStudent(id, student);
      alert("✅ Student updated successfully!");
      navigate("/admin/students/view");
    } catch (err) {
      alert("❌ Failed to update student");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (!student)
    return <p className="text-center text-danger">Student not found.</p>;

  return (
    <Card className="shadow-sm p-4" style={{ maxWidth: "900px", margin: "auto" }}>
      <h3 className="text-primary text-center mb-4">Edit Student</h3>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={student.name}
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
                value={student.email}
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
                value={student.phone}
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
                value={student.department}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Course</Form.Label>
              <Form.Control
                type="text"
                name="course"
                value={student.course}
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
                value={student.city}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                name="state"
                value={student.state}
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
                value={student.country}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                name="address"
                rows={2}
                value={student.address}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" className="w-100 mt-3">
          Update Student
        </Button>
      </Form>
    </Card>
  );
}

export default EditStudentForm;
