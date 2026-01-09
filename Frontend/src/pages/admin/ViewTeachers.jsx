import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, InputGroup, Form } from "react-bootstrap";
import { getAllTeachers, deleteTeacher } from "../../api/adminService";
import { useNavigate } from "react-router-dom";

function ViewTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadTeachers = async () => {
    try {
      const data = await getAllTeachers();
      setTeachers(data);
      setFiltered(data);
    } catch (err) {
      console.error("❌ Failed to fetch teachers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    const result = teachers.filter((t) =>
      t.name?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, teachers]);

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete this teacher?")) {
      try {
        await deleteTeacher(id);
        alert("✅ Teacher deleted!");
        loadTeachers();
      } catch (err) {
        alert("❌ Failed to delete teacher.");
      }
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">All Teachers</h4>
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
            <th>Specialization</th>
            <th>Qualification</th>
            <th>Experience</th>
            <th>Date of Joining</th>
            <th>Password</th>
            <th>City</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="13" className="text-center text-muted">
                No teachers found.
              </td>
            </tr>
          ) : (
            filtered.map((teacher, idx) => (
              <tr key={teacher.id}>
                <td>{idx + 1}</td>
                <td>{teacher.name}</td>
                <td>{teacher.email}</td>
                <td>{teacher.phone}</td>
                <td>{teacher.department}</td>
                <td>{teacher.specialization}</td>
                <td>{teacher.qualification}</td>
                <td>{teacher.experience}</td>
                <td>{teacher.dateOfJoining}</td>
                <td>{teacher.password}</td>
                <td>{teacher.city}</td>
                <td>{teacher.country}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default ViewTeachers;
