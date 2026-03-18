// pages/teacher/AddMarks.jsx
import React, { useState } from "react";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { BookOpen, Search, CheckCircle, XCircle, AlertCircle, User } from "lucide-react";
import { getStudentByRollNo, addMarks } from "../../api/teacherService";
import { useAuth } from "../../context/AuthContext";
import { validateMarks, validateRequired, sanitizeInput } from "../../utils/validators";

function AddMarks() {
  const { user } = useAuth();
  
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    subject: "",
    examType: "MID1",
    marksObtained: "",
    totalMarks: "100",
    semester: "1",
    remarks: ""
  });

  const handleFetchStudent = async () => {
    const trimmedRollNo = rollNo.trim().toUpperCase();
    
    if (!trimmedRollNo) {
      setError("Please enter a roll number");
      return;
    }
    
    setFetching(true);
    setError(null);
    setStudent(null);
    setSuccess(null);

    try {
      const data = await getStudentByRollNo(trimmedRollNo);
      setStudent(data);
    } catch (err) {
      setError(err.message || "Student not found with this roll number");
    } finally {
      setFetching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFetchStudent();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Subject validation
    const subjectValidation = validateRequired(form.subject, "Subject");
    if (!subjectValidation.valid) {
      errors.subject = subjectValidation.message;
    }
    
    // Marks validation
    const marksValidation = validateMarks(form.marksObtained, form.totalMarks);
    if (!marksValidation.valid) {
      errors.marksObtained = marksValidation.message;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!student) {
      setError("Please search for a student first");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await addMarks({
        teacherId: user.id,
        studentId: student.id,
        subject: sanitizeInput(form.subject),
        examType: form.examType,
        marksObtained: parseFloat(form.marksObtained),
        totalMarks: parseFloat(form.totalMarks),
        semester: parseInt(form.semester),
        remarks: sanitizeInput(form.remarks)
      });
      
      setSuccess(`Marks added successfully for ${student.name}!`);
      
      // Reset form
      setForm({
        subject: "",
        examType: "MID1",
        marksObtained: "",
        totalMarks: "100",
        semester: "1",
        remarks: ""
      });
      setStudent(null);
      setRollNo("");
      setFieldErrors({});
      
      // Auto-hide success message
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err) {
      console.error("Error adding marks:", err);
      
      if (err.status === 409) {
        setError("Marks already exist for this student in this exam. Please update instead.");
      } else if (err.data?.errors) {
        setFieldErrors(err.data.errors);
      } else {
        setError(err.message || "Failed to add marks. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Add Marks</h1>
        <p className="text-muted mb-0">Enter student marks for exams</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
          <CheckCircle size={20} />
          <span>{success}</span>
          <button 
            type="button" 
            className="btn-close ms-auto" 
            onClick={() => setSuccess(null)}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <XCircle size={20} />
          <span>{error}</span>
          <button 
            type="button" 
            className="btn-close ms-auto" 
            onClick={() => setError(null)}
          />
        </div>
      )}

      {/* Search Student */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent">
          <h5 className="mb-0 fw-bold">Search Student</h5>
        </div>
        <div className="card-body">
          <Row className="align-items-end g-3">
            <Col md={8}>
              <Form.Label className="fw-medium">Roll Number</Form.Label>
              <div className="position-relative">
                <Search 
                  size={18} 
                  className="position-absolute" 
                  style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6c757d" }} 
                />
                <Form.Control
                  className="ps-5"
                  placeholder="Enter Roll No (e.g., STU001)"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={fetching}
                />
              </div>
            </Col>
            <Col md={4}>
              <button
                className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleFetchStudent}
                disabled={fetching || !rollNo.trim()}
              >
                {fetching ? (
                  <>
                    <Spinner size="sm" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Search
                  </>
                )}
              </button>
            </Col>
          </Row>

          {/* Student Info */}
          {student && (
            <div 
              className="mt-4 p-3 rounded d-flex align-items-center gap-3"
              style={{ background: "rgba(16, 185, 129, 0.1)" }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                style={{ 
                  width: "48px", 
                  height: "48px", 
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  flexShrink: 0
                }}
              >
                {student.name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{student.name}</h6>
                <small className="text-muted">
                  {student.rollNo} • {student.department || "N/A"} • {student.course || "N/A"}
                </small>
              </div>
              <CheckCircle size={24} className="text-success ms-auto" />
            </div>
          )}
        </div>
      </div>

      {/* Marks Form */}
      {student && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-transparent">
            <h5 className="mb-0 fw-bold">Marks Details</h5>
          </div>
          <div className="card-body">
            <Form onSubmit={handleSubmit}>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Subject *</Form.Label>
                    <Form.Control
                      placeholder="e.g., Data Structures"
                      value={form.subject}
                      onChange={(e) => handleFormChange("subject", e.target.value)}
                      isInvalid={!!fieldErrors.subject}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.subject}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Exam Type *</Form.Label>
                    <Form.Select
                      value={form.examType}
                      onChange={(e) => handleFormChange("examType", e.target.value)}
                      required
                    >
                      <option value="MID1">Mid Term 1</option>
                      <option value="MID2">Mid Term 2</option>
                      <option value="FINAL">Final Exam</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="PRACTICAL">Practical</option>
                      <option value="QUIZ">Quiz</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Marks Obtained *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="e.g., 85"
                      value={form.marksObtained}
                      onChange={(e) => handleFormChange("marksObtained", e.target.value)}
                      isInvalid={!!fieldErrors.marksObtained}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.marksObtained}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Total Marks *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.5"
                      min="1"
                      placeholder="e.g., 100"
                      value={form.totalMarks}
                      onChange={(e) => handleFormChange("totalMarks", e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Semester *</Form.Label>
                    <Form.Select
                      value={form.semester}
                      onChange={(e) => handleFormChange("semester", e.target.value)}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-medium">Remarks (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Add any additional notes..."
                      value={form.remarks}
                      onChange={(e) => handleFormChange("remarks", e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <button
                    type="submit"
                    className="btn btn-success w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" />
                        Adding Marks...
                      </>
                    ) : (
                      <>
                        <BookOpen size={20} />
                        Add Marks
                      </>
                    )}
                  </button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddMarks;