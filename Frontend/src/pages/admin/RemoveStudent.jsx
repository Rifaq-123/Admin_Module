import React, { useState } from "react";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { Search, Trash2, AlertTriangle, CheckCircle, XCircle, User } from "lucide-react";
import { getStudentByRollNo, deleteStudent } from "../../api/adminService";
import "../../styles/AdminStyles.css";

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
      setError(err.message || "Student not found");
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
      setError(err.message || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Delete Student</h1>
        <p className="page-subtitle">Remove a student from the system</p>
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

      {/* Student Info Card */}
      {student && (
        <div className="card-modern" style={{ borderLeft: "4px solid #ef4444" }}>
          <div className="card-body-modern">
            <div className="d-flex align-items-start gap-4">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger"
                style={{ width: "64px", height: "64px", flexShrink: 0 }}
              >
                <User size={28} />
              </div>

              <div className="flex-grow-1">
                <h4 className="mb-1">{student.name}</h4>
                <p className="text-muted mb-3">{student.email}</p>

                <div className="d-flex gap-4 mb-4">
                  <div>
                    <small className="text-muted d-block">Roll No</small>
                    <span className="badge-modern badge-primary">{student.rollNo}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Department</small>
                    <span>{student.department || "N/A"}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Phone</small>
                    <span>{student.phone || "N/A"}</span>
                  </div>
                </div>

                {/* Warning Box */}
                <div className="p-3 rounded mb-4" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                  <div className="d-flex align-items-center gap-2 text-warning mb-1">
                    <AlertTriangle size={18} />
                    <strong>Warning</strong>
                  </div>
                  <p className="mb-0 small" style={{ color: "#92400e" }}>
                    This action cannot be undone. All data associated with this student will be permanently deleted.
                  </p>
                </div>

                <button
                  className="btn btn-modern btn-danger-modern"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ padding: "0.75rem 2rem" }}
                >
                  {deleting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RemoveStudent;