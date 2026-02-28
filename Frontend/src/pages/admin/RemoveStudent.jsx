// src/Pages/admin/RemoveStudent.jsx

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
  deleteStudent,
} from "../../api/adminService";

function RemoveStudent() {

  const [rollNo, setRollNo] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [student, setStudent] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFetch = async () => {
    if (!rollNo) return;

    setFetching(true);
    setError(null);
    setSuccess(null);
    setStudent(null);

    try {
      const data = await getStudentByRollNo(rollNo);

      setStudent(data);
      setStudentId(data.id);

    } catch (err) {
      setError("Student not found");
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async () => {
    if (!studentId) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteStudent(studentId);

      setSuccess("Student deleted successfully!");
      setStudent(null);
      setRollNo("");
      setStudentId(null);

    } catch (err) {
      setError("Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="shadow-sm border-0 p-4">
      <h3 className="text-danger text-center mb-4 fw-bold">
        Remove Student
      </h3>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

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
            variant="secondary"
            className="w-100"
            onClick={handleFetch}
            disabled={fetching}
          >
            {fetching ? <Spinner size="sm" /> : "Fetch Student"}
          </Button>
        </Col>
      </Row>

      {student && (
        <Card className="mb-3 p-3 bg-light">
          <p><strong>Roll No:</strong> {student.rollNo}</p>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Email:</strong> {student.email}</p>

          <Button
            variant="danger"
            className="w-100 mt-3"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Spinner size="sm" /> : "Confirm Delete"}
          </Button>
        </Card>
      )}
    </Card>
  );
}

export default RemoveStudent;