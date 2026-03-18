// pages/admin/AddStudent.jsx
import React, { useState, useCallback } from "react";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { UserPlus, Mail, Phone, Building, BookOpen, MapPin, Calendar, Lock, CheckCircle, XCircle } from "lucide-react";
import { addStudent } from "../../api/adminService";
import { toast } from "react-toastify";
import "../../styles/AdminStyles.css";

function AddStudent() {
  const initialState = {
    name: "",
    email: "",
    phone: "",
    department: "",
    course: "",
    address: "",
    city: "",
    state: "",
    country: "",
    dateOfJoining: "",
    password: "student123",
  };

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Memoized validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!form.name || form.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }

    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!form.dateOfJoining) {
      newErrors.dateOfJoining = "Date of joining is required";
    }

    if (!form.password || form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // ✅ Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      await addStudent(form);
      toast.success("Student added successfully!");
      setForm(initialState);
      setErrors({});
    } catch (err) {
      toast.error(err.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Add Student</h1>
        <p className="page-subtitle">Create a new student account in the system</p>
      </div>

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
                  className={`form-control-modern ${errors.name ? 'is-invalid' : ''}`}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Mail size={16} className="me-2" />
                  Email Address *
                </Form.Label>
                <Form.Control
                  className={`form-control-modern ${errors.email ? 'is-invalid' : ''}`}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Phone size={16} className="me-2" />
                  Phone Number
                </Form.Label>
                <Form.Control
                  className={`form-control-modern ${errors.phone ? 'is-invalid' : ''}`}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10 digit phone number"
                  maxLength={10}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Calendar size={16} className="me-2" />
                  Date of Joining *
                </Form.Label>
                <Form.Control
                  className={`form-control-modern ${errors.dateOfJoining ? 'is-invalid' : ''}`}
                  type="date"
                  name="dateOfJoining"
                  value={form.dateOfJoining}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                {errors.dateOfJoining && <div className="invalid-feedback">{errors.dateOfJoining}</div>}
              </Form.Group>
            </Col>

            {/* Academic Information */}
            <Col xs={12} className="mt-4">
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
                Academic Information
              </h6>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <Building size={16} className="me-2" />
                  Department
                </Form.Label>
                <Form.Select
                  className="form-control-modern"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">
                  <BookOpen size={16} className="me-2" />
                  Course
                </Form.Label>
                <Form.Select
                  className="form-control-modern"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                >
                  <option value="">Select Course</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                </Form.Select>
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
                  Password *
                </Form.Label>
                <Form.Control
                  className={`form-control-modern ${errors.password ? 'is-invalid' : ''}`}
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                <Form.Text className="text-muted">
                  Minimum 6 characters
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
                    Adding Student...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Add Student
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

export default AddStudent;