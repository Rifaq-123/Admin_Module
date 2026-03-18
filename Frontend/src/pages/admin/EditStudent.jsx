import React, { useState } from "react";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { Search, Save, UserCheck, CheckCircle, XCircle } from "lucide-react";
import { getStudentByRollNo, updateStudent } from "../../api/adminService";
import "../../styles/AdminStyles.css";

function EditStudent() {
  const [rollNo, setRollNo] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFetch = async () => {
    if (!rollNo) return;
    setFetching(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await getStudentByRollNo(rollNo);
      setForm(data);
      setStudentId(data.id);
    } catch (err) {
      setError(err.message || "Student not found");
      setForm(null);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      setError(err.message || "Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Update Student</h1>
        <p className="page-subtitle">Search and update student information</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert-modern alert-success-modern mb-4">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-modern alert-danger-modern mb-4">
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Card */}
      <div className="card-modern mb-4">
        <div className="card-header-modern">
          <span>Search Student</span>
        </div>
        <div className="card-body-modern">
          <Row className="align-items-end g-3">
            <Col md={8}>
              <Form.Label className="form-label-modern">Roll Number</Form.Label>
              <div className="position-relative">
                <Search size={18} className="position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <Form.Control
                  className="form-control-modern"
                  style={{ paddingLeft: "40px" }}
                  type="text"
                  placeholder="Enter Roll No (e.g., STU001)"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4}>
              <button
                className="btn btn-modern btn-primary-modern w-100"
                onClick={handleFetch}
                disabled={fetching}
              >
                {fetching ? <Spinner size="sm" /> : <><Search size={18} /> Search</>}
              </button>
            </Col>
          </Row>
        </div>
      </div>

      {/* Edit Form */}
      {form && (
        <div className="form-modern">
          <h6 className="text-uppercase text-muted fw-bold mb-4" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
            Student Information
          </h6>

          <Form onSubmit={handleUpdate}>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-modern">Full Name</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-modern">Email</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-modern">Phone</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-modern">Department</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    name="department"
                    value={form.department || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-modern">Course</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    name="course"
                    value={form.course || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-modern">Date of Joining</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    type="date"
                    name="dateOfJoining"
                    value={form.dateOfJoining || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="form-label-modern">City</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    name="city"
                    value={form.city || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="form-label-modern">State</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    name="state"
                    value={form.state || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="form-label-modern">Country</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    name="country"
                    value={form.country || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} className="mt-4">
                <button
                  type="submit"
                  className="btn btn-modern btn-primary-modern"
                  disabled={loading}
                  style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Update Student
                    </>
                  )}
                </button>
              </Col>
            </Row>
          </Form>
        </div>
      )}
    </div>
  );
}

export default EditStudent;