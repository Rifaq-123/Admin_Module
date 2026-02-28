// src/Pages/admin/EditStudent.jsx

import React, { useState } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";

import {
  getStudentByRollNo,
  updateStudent,
} from "../../api/adminService";

function EditStudent() {

  // ✅ Proper states
  const [rollNo, setRollNo] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===============================
  // 🔍 Fetch by Roll No
  // ===============================
  const handleFetch = async () => {
    if (!rollNo) return;

    setFetching(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await getStudentByRollNo(rollNo);

      setForm(data);
      setStudentId(data.id); // store ID internally

    } catch (err) {
      setError("Student not found");
      setForm(null);
    } finally {
      setFetching(false);
    }
  };

  // ===============================
  // ✏ Handle Form Change
  // ===============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===============================
  // 🔄 Update Student
  // ===============================
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!studentId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateStudent(studentId, form);
      setSuccess("Student updated successfully!");
    } catch (err) {
      setError("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 p-4">
      <h3 className="text-primary text-center mb-4 fw-bold">
        Edit Student
      </h3>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Fetch Section */}
      <Row className="mb-4">
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder="Enter Roll No (e.g., STU001)"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Button
            variant="info"
            className="w-100"
            onClick={handleFetch}
            disabled={fetching}
          >
            {fetching ? <Spinner size="sm" /> : "Fetch Student"}
          </Button>
        </Col>
      </Row>

      {/* Edit Form */}
      {form && (
        <Form onSubmit={handleUpdate}>
          <Row>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  value={form.email || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  name="department"
                  value={form.department || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Course</Form.Label>
                <Form.Control
                  name="course"
                  value={form.course || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  name="city"
                  value={form.city || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control
                  name="state"
                  value={form.state || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  name="country"
                  value={form.country || ""}
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
                  value={form.dateOfJoining || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

          </Row>

          <Button
            type="submit"
            variant="warning"
            className="w-100"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Update Student"}
          </Button>
        </Form>
      )}
    </Card>
  );
}

export default EditStudent;