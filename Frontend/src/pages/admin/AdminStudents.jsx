import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card,
  InputGroup,
} from "react-bootstrap";
import {
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../../api/adminService";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    department: "",
    course: "",
    password: "123",
  });
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load all students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      // sort by joining date (most recent first)
      const sorted = data.sort((a, b) => new Date(b.dateOfJoining) - new Date(a.dateOfJoining));
      setStudents(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search filter
  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      students.filter(
        (s) =>
          s.name?.toLowerCase().includes(lower) ||
          s.email?.toLowerCase().includes(lower) ||
          s.department?.toLowerCase().includes(lower) ||
          s.course?.toLowerCase().includes(lower)
      )
    );
  }, [search, students]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateStudent(form.id, form);
        alert("✅ Student updated successfully!");
      } else {
        await addStudent(form);
        alert("✅ Student added successfully!");
      }
      resetForm();
      loadStudents();
    } catch (err) {
      console.error("Error saving student:", err);
      alert("❌ Failed to save student");
    }
  };

  const handleEdit = (student) => {
    setForm(student);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await deleteStudent(id);
      loadStudents();
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      email: "",
      department: "",
      course: "",
      password: "123",
    });
    setIsEditing(false);
  };

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-primary">🎓 Student Management</h3>
        <Form.Control
          type="text"
          placeholder="🔍 Search students..."
          style={{ maxWidth: "250px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Row>
        {/* Left side form */}
        <Col md={4}>
          <Card className="shadow-sm border-0 p-3">
            <h5 className="text-secondary mb-3">
              {isEditing ? "✏️ Edit Student" : "➕ Add New Student"}
            </h5>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter student name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Course</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. BCA, BSc, MCA..."
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={form.password}
                    readOnly
                    disabled
                  />
                  <InputGroup.Text>Default: 123</InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Button
                type="submit"
                variant={isEditing ? "warning" : "primary"}
                className="w-100"
              >
                {isEditing ? "Update Student" : "Add Student"}
              </Button>

              {isEditing && (
                <Button
                  variant="secondary"
                  className="w-100 mt-2"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
            </Form>
          </Card>
        </Col>

        {/* Right side table */}
        <Col md={8}>
          <Card className="shadow-sm border-0 p-3">
            <h5 className="text-secondary mb-3">📋 Student Records</h5>

            {loading ? (
              <p>Loading students...</p>
            ) : (
              <Table striped hover responsive className="align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Joined</th>
                    <th>Ends</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((s, i) => (
                      <tr key={s.id}>
                        <td>{i + 1}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.department}</td>
                        <td>{s.course}</td>
                        <td>{s.dateOfJoining || "—"}</td>
                        <td>{s.endDate || "—"}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() => handleEdit(s)}
                          >
                            Edit
                          </Button>{" "}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(s.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">
                        No matching students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminStudents;
