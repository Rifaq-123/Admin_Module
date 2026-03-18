import React, { useState } from "react";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { Search, Trash2, AlertTriangle, CheckCircle, XCircle, GraduationCap, Mail, Phone, Award } from "lucide-react";
import { getTeacherById, deleteTeacher } from "../../api/adminService";
import "../../styles/AdminStyles.css";

function RemoveTeacher() {
  const [teacherId, setTeacherId] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFetch = async () => {
    if (!teacherId) return;
    setFetching(true);
    setError(null);
    setSuccess(null);

    try {
      const found = await getTeacherById(teacherId);
      setTeacher(found);
      setError(null);
    } catch (err) {
      setError(err.message || "Teacher not found");
      setTeacher(null);
    } finally {
      setFetching(false);
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
    } catch (err) {
      setError(err.message || "Failed to delete teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Delete Teacher</h1>
        <p className="page-subtitle">Remove a teacher from the system</p>
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
          <span>Search Teacher</span>
        </div>
        <div className="card-body-modern">
          <Row className="align-items-end g-3">
            <Col md={8}>
              <Form.Label className="form-label-modern">Teacher ID</Form.Label>
              <div className="position-relative">
                <Search size={18} className="position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <Form.Control
                  className="form-control-modern"
                  style={{ paddingLeft: "40px" }}
                  placeholder="Enter Teacher ID"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
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

      {/* Teacher Info Card */}
      {teacher && (
        <div className="card-modern" style={{ borderLeft: "4px solid #ef4444" }}>
          <div className="card-body-modern">
            <div className="d-flex align-items-start gap-4">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger"
                style={{ width: "64px", height: "64px", flexShrink: 0 }}
              >
                <GraduationCap size={28} />
              </div>

              <div className="flex-grow-1">
                <h4 className="mb-1">{teacher.name}</h4>
                <p className="text-muted mb-3">{teacher.email}</p>

                <Row className="g-3 mb-4">
                  <Col md={3}>
                    <small className="text-muted d-block">Department</small>
                    <span className="badge-modern badge-success">{teacher.department || "N/A"}</span>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted d-block">Subject</small>
                    <span>{teacher.subject || "N/A"}</span>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted d-block">Experience</small>
                    <span>{teacher.experience || 0} years</span>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted d-block">Phone</small>
                    <span>{teacher.phone || "N/A"}</span>
                  </Col>
                </Row>

                {/* Warning Box */}
                <div className="p-3 rounded mb-4" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                  <div className="d-flex align-items-center gap-2 text-warning mb-1">
                    <AlertTriangle size={18} />
                    <strong>Warning</strong>
                  </div>
                  <p className="mb-0 small" style={{ color: "#92400e" }}>
                    This action cannot be undone. All data associated with this teacher will be permanently deleted.
                  </p>
                </div>

                <button
                  className="btn btn-modern btn-danger-modern"
                  onClick={handleDelete}
                  disabled={loading}
                  style={{ padding: "0.75rem 2rem" }}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Teacher
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

export default RemoveTeacher;