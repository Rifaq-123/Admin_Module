import React, { useEffect, useState } from "react";
import { Table, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { getAllStudents, deleteStudent } from "../../api/adminService";

function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      const data = await getAllStudents();
      setStudents(data);
      setFiltered(data);
    } catch (err) {
      console.error("❌ Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const result = students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, students]);

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
        alert("✅ Student deleted!");
        loadStudents();
      } catch (err) {
        alert("❌ Failed to delete student.");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">All Students</h4>
        <InputGroup style={{ maxWidth: "300px" }}>
          <Form.Control
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Course</th>
            <th>Address</th>
            <th>City</th>
            <th>State</th>
            <th>Country</th>
            <th>Join Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="13" className="text-center text-muted">
                No students found.
              </td>
            </tr>
          ) : (
            filtered.map((student, idx) => (
              <tr key={student.id}>
                <td>{idx + 1}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.department}</td>
                <td>{student.course}</td>
                <td>{student.address}</td>
                <td>{student.city}</td>
                <td>{student.state}</td>
                <td>{student.country}</td>
                <td>{student.dateOfJoining}</td>
                <td>{student.endDate}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                  >
                    🗑 Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default ViewStudents;
