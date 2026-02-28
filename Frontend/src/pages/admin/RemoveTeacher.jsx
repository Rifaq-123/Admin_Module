// src/Pages/admin/RemoveTeacher.jsx

import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { getTeachers, deleteTeacher } from "../../api/adminService";

function RemoveTeacher() {
  const [teacherId, setTeacherId] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFetch = async () => {
    try {
      const teachers = await getTeachers();
      const found = teachers.find(t => t.id === Number(teacherId));
      if (!found) throw new Error();
      setTeacher(found);
      setError(null);
    } catch {
      setError("Teacher not found");
      setTeacher(null);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteTeacher(teacherId);
      setSuccess("Teacher deleted successfully!");
      setTeacher(null);
      setTeacherId("");
    } catch {
      setError("Failed to delete teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 p-4" style={{ maxWidth: "900px", margin: "auto" }}>
      <h3 className="text-danger text-center mb-4 fw-bold">
        Remove Teacher
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

      {teacher && (
        <Card className="p-3 bg-light border-0 shadow-sm">
          <h5>{teacher.name}</h5>
          <p>Email: {teacher.email}</p>
          <p>Department: {teacher.department}</p>
          <p>Subject: {teacher.subject}</p>

          <Button
            variant="danger"
            className="w-100"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Confirm Delete"}
          </Button>
        </Card>
      )}
    </Card>
  );
}

export default RemoveTeacher;