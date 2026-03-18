import React, { useState, useEffect } from "react";
import { Row, Col, Form, Spinner, Tab, Tabs } from "react-bootstrap";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  BookOpen, 
  MapPin,
  Save,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Hash,
  GraduationCap
} from "lucide-react";
import { getMyProfile, updateMyProfile, changePassword } from "../../api/studentService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AdminStyles.css";

function StudentProfile() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    rollNo: "",
    phone: "",
    department: "",
    course: "",
    address: "",
    city: "",
    state: "",
    country: ""
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMyProfile(user.id);
      setProfile({
        name: data.name || "",
        email: data.email || "",
        rollNo: data.rollNo || "",
        phone: data.phone || "",
        department: data.department || "",
        course: data.course || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || ""
      });
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSuccess(null);
    setError(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateMyProfile(user.id, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country
      });
      
      if (response.success) {
        setSuccess("Profile updated successfully!");
        
        // Update local storage if name changed
        if (response.student?.name) {
          const updatedUser = { ...user, name: response.student.name };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-modern"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your profile information and password</p>
      </div>

      {/* Profile Card */}
      <Row className="g-4">
        {/* Left Column - Avatar & Quick Info */}
        <Col lg={4}>
          <div className="card-modern">
            <div className="card-body-modern text-center">
              {/* Avatar */}
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold mb-3"
                style={{
                  width: "100px",
                  height: "100px",
                  fontSize: "2.5rem",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)"
                }}
              >
                {profile.name?.charAt(0).toUpperCase() || "S"}
              </div>
              
              <h4 className="fw-bold mb-1">{profile.name || "Student"}</h4>
              <p className="text-muted mb-3">{profile.email}</p>
              
              <div className="d-flex flex-column gap-2 text-start">
                <div className="d-flex align-items-center gap-2 text-muted">
                  <Hash size={16} />
                  <span>{profile.rollNo || "N/A"}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <Building size={16} />
                  <span>{profile.department || "N/A"}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <GraduationCap size={16} />
                  <span>{profile.course || "N/A"}</span>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <Phone size={16} />
                  <span>{profile.phone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Right Column - Edit Forms */}
        <Col lg={8}>
          <div className="card-modern">
            <Tabs defaultActiveKey="profile" className="mb-0">
              {/* Profile Tab */}
              <Tab eventKey="profile" title={<span><User size={16} className="me-2" />Profile</span>}>
                <div className="card-body-modern">
                  {/* Alerts */}
                  {success && (
                    <div className="alert-modern alert-success-modern mb-4">
                      <CheckCircle size={18} />
                      <span>{success}</span>
                    </div>
                  )}
                  {error && (
                    <div className="alert-modern alert-danger-modern mb-4">
                      <XCircle size={18} />
                      <span>{error}</span>
                    </div>
                  )}

                  <Form onSubmit={handleProfileSubmit}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            <User size={14} className="me-2" />
                            Full Name
                          </Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            value={profile.name}
                            onChange={(e) => handleProfileChange("name", e.target.value)}
                            placeholder="Enter your name"
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            <Mail size={14} className="me-2" />
                            Email (Cannot change)
                          </Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            value={profile.email}
                            disabled
                            style={{ backgroundColor: "#f8fafc" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            <Hash size={14} className="me-2" />
                            Roll Number (Cannot change)
                          </Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            value={profile.rollNo}
                            disabled
                            style={{ backgroundColor: "#f8fafc" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            <Phone size={14} className="me-2" />
                            Phone
                          </Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            value={profile.phone}
                            onChange={(e) => handleProfileChange("phone", e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            <Building size={14} className="me-2" />
                            Department (Cannot change)
                          </Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            value={profile.department}
                            disabled
                            style={{ backgroundColor: "#f8fafc" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            <GraduationCap size={14} className="me-2" />
                            Course (Cannot change)
                          </Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            value={profile.course}
                            disabled
                            style={{ backgroundColor: "#f8fafc" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            <MapPin size={14} className="me-2" />
                            Address
                          </Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            as="textarea"
                            rows={2}
                            value={profile.address}
                            onChange={(e) => handleProfileChange("address", e.target.value)}
                            placeholder="Enter address"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">City</Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            value={profile.city}
                            onChange={(e) => handleProfileChange("city", e.target.value)}
                            placeholder="City"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">State</Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            value={profile.state}
                            onChange={(e) => handleProfileChange("state", e.target.value)}
                            placeholder="State"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">Country</Form.Label>
                          <Form.Control
                            className="form-control-modern"
                            value={profile.country}
                            onChange={(e) => handleProfileChange("country", e.target.value)}
                            placeholder="Country"
                          />
                        </Form.Group>
                      </Col>

                      <Col xs={12}>
                        <button
                          type="submit"
                          className="btn btn-modern btn-primary-modern w-100"
                          disabled={saving}
                          style={{ 
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #f59e0b, #d97706)"
                          }}
                        >
                          {saving ? (
                            <>
                              <Spinner size="sm" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Tab>

              {/* Password Tab */}
              <Tab eventKey="password" title={<span><Lock size={16} className="me-2" />Password</span>}>
                <div className="card-body-modern">
                  {/* Alerts */}
                  {passwordSuccess && (
                    <div className="alert-modern alert-success-modern mb-4">
                      <CheckCircle size={18} />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}
                  {passwordError && (
                    <div className="alert-modern alert-danger-modern mb-4">
                      <XCircle size={18} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <Form onSubmit={handlePasswordSubmit}>
                    <Row className="g-3">
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            Current Password
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              className="form-control-modern"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                              onClick={() => togglePasswordVisibility("current")}
                              style={{ border: "none", background: "none" }}
                            >
                              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            New Password
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              className="form-control-modern"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                              placeholder="Enter new password"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                              onClick={() => togglePasswordVisibility("new")}
                              style={{ border: "none", background: "none" }}
                            >
                              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <Form.Text className="text-muted">
                            Minimum 6 characters
                          </Form.Text>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label-modern">
                            Confirm New Password
                          </Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              className="form-control-modern"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                              placeholder="Confirm new password"
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                              onClick={() => togglePasswordVisibility("confirm")}
                              style={{ border: "none", background: "none" }}
                            >
                              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </Form.Group>
                      </Col>

                      <Col xs={12}>
                        <button
                          type="submit"
                          className="btn btn-modern btn-primary-modern w-100"
                          disabled={changingPassword}
                          style={{ 
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #f59e0b, #d97706)"
                          }}
                        >
                          {changingPassword ? (
                            <>
                              <Spinner size="sm" />
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <Lock size={18} />
                              Change Password
                            </>
                          )}
                        </button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Tab>
            </Tabs>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default StudentProfile;