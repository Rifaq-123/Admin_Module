// src/Pages/admin/ViewStudents.jsx

import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Alert, Badge } from "react-bootstrap";
import { getStudents } from "../../api/adminService";

function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <Card className="shadow-sm border-0 p-4">
      <h3 className="fw-bold text-primary mb-4 text-center">
        Students List
      </h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : students.length === 0 ? (
        <Alert variant="info">No students found.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Course</th>
              <th>City</th>
              <th>Date of Joining</th>
              <th>Phone</th>
              <th>State</th>
              <th>Country</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td>{student.rollNo}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <Badge bg="secondary">
                    {student.department || "N/A"}
                  </Badge>
                </td>
                <td>{student.course || "N/A"}</td>
                <td>{student.city || "N/A"}</td>
                <td>{student.dateOfJoining || "N/A"}</td>
                <td>{student.phone || "N/A" }</td>
                <td>{student.state || "N/A" }</td>
                <td>{student.country || "N/A" }</td>
                <td>{student.address || "N/A" }</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

export default ViewStudents;