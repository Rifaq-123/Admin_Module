// src/Pages/admin/ViewTeachers.jsx

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Alert, Badge } from "react-bootstrap";
import { getTeachers } from "../../api/adminService";

function ViewTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getTeachers();
        setTeachers(data);
      } catch {
        setError("Failed to fetch teachers");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <Card className="shadow-sm border-0 p-4" style={{ maxWidth: "1000px", margin: "auto" }}>
      <h3 className="text-primary text-center mb-4 fw-bold">
        View Teachers
      </h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner />
        </div>
      ) : teachers.length === 0 ? (
        <Alert variant="info">No teachers found</Alert>
      ) : (
        <Row>
          {teachers.map((teacher) => (
            <Col md={6} key={teacher.id} className="mb-3">
              <Card className="p-3 bg-light border-0 shadow-sm">
                <h5 className="fw-bold">{teacher.name}</h5>
                <p><strong>Email:</strong> {teacher.email}</p>
                <p><strong>Department:</strong> 
                  <Badge bg="secondary" className="ms-2">
                    {teacher.department}
                  </Badge>
                </p>
                <p><strong>Subject:</strong> {teacher.subject}</p>
                <p><strong>Experience:</strong> {teacher.experience} yrs</p>
                <p><strong>City:</strong> {teacher.city}</p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
}

export default ViewTeachers;