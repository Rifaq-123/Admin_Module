import React, { useState } from "react";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Building, 
  BookOpen, 
  Award,
  Briefcase,
  MapPin, 
  Calendar, 
  Lock, 
  CheckCircle, 
  XCircle 
} from "lucide-react";
import { addTeacher } from "../../api/adminService";
import "../../styles/AdminStyles.css";

function AddTeacher() {
  const initialState = {
    name: "",
    email: "",
    phone: "",
    department: "",
    subject: "",
    specialization: "",
    qualification: "",
    experience: "",
    address: "",
    city: "",
    state: "",
    country: "",
    dateOfJoining: "",
    password: "teacher123",
  };

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const cleanedForm = {
        ...form,
        experience: form.experience ? Number(form.experience) : null,
        dateOfJoining: form.dateOfJoining || null
      };

      await addTeacher(cleanedForm);
      setSuccess("Teacher added successfully!");
      setForm(initialState);
    } catch (err) {
      setError(err.message || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Add Teacher</h1>
        <p className="page-subtitle">Create a new teacher account in the system</p>
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

      {/* Form */}
      <div className="form-modern">
        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            {/* Personal Information */}
            <Col xs={12}>
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
                Personal Information
              </h6>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <UserPlus size={16} className="me-2" />
                  Full Name *
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Mail size={16} className="me-2" />
                  Email Address *
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Phone size={16} className="me-2" />
                  Phone Number
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Calendar size={16} className="me-2" />
                  Date of Joining *
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  type="date"
                  name="dateOfJoining"
                  value={form.dateOfJoining}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            {/* Professional Information */}
            <Col xs={12} className="mt-4">
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
                Professional Information
              </h6>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Building size={16} className="me-2" />
                  Department
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <BookOpen size={16} className="me-2" />
                  Subject
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g., Data Structures"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Award size={16} className="me-2" />
                  Specialization
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Machine Learning"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Award size={16} className="me-2" />
                  Qualification
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="e.g., Ph.D. in Computer Science"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Briefcase size={16} className="me-2" />
                  Experience (Years)
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  type="number"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                />
              </Form.Group>
            </Col>

            {/* Address Information */}
            <Col xs={12} className="mt-4">
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
                Address Information
              </h6>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="form-label-modern">City</Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="form-label-modern">State</Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="form-label-modern">Country</Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <MapPin size={16} className="me-2" />
                  Full Address
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  as="textarea"
                  rows={2}
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                />
              </Form.Group>
            </Col>

            {/* Account Security */}
            <Col xs={12} className="mt-4">
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
                Account Security
              </h6>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Lock size={16} className="me-2" />
                  Password
                </Form.Label>
                <Form.Control
                  className="form-control-modern"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
                <Form.Text className="text-muted">
                  Default password: teacher123
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Submit Button */}
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
                    Adding Teacher...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Add Teacher
                  </>
                )}
              </button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

export default AddTeacher;