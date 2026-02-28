// src/Pages/admin/EditTeacher.jsx

import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { getTeachers, updateTeacher } from "../../api/adminService";

function EditTeacher() {
  const [teacherId, setTeacherId] = useState("");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFetch = async () => {
    try {
      const teachers = await getTeachers();
      const found = teachers.find(t => t.id === Number(teacherId));
      if (!found) throw new Error();
      setForm(found);
      setError(null);
    } catch {
      setError("Teacher not found");
      setForm(null);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateTeacher(teacherId, form);
      setSuccess("Teacher updated successfully!");
    } catch {
      setError("Failed to update teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 p-4" style={{ maxWidth: "900px", margin: "auto" }}>
      <h3 className="text-primary text-center mb-4 fw-bold">
        Edit Teacher
      </h3>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-3">
        <Col md={8}>
          <Form.Control
            placeholder="Enter Teacher ID"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Button onClick={handleFetch} className="w-100">
            Load Teacher
          </Button>
        </Col>
      </Row>

      {form && (
        <Form onSubmit={handleSubmit}>
          <Row>
            {Object.keys(form).map((key) =>
              key !== "id" ? (
                <Col md={6} key={key}>
                  <Form.Group className="mb-3">
                    <Form.Label>{key}</Form.Label>
                    <Form.Control
                      name={key}
                      value={form[key] || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              ) : null
            )}
          </Row>

          <Button type="submit" variant="warning" className="w-100" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Update Teacher"}
          </Button>
        </Form>
      )}
    </Card>
  );
}

export default EditTeacher;