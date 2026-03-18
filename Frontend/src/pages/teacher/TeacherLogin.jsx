// pages/teacher/TeacherLogin.jsx
import React, { useState, useEffect } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Lock, Mail, LogIn, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { validateEmail } from "../../utils/validators";

function TeacherLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && role === "TEACHER") {
      navigate("/teacher/dashboard", { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error on input change
  };

  const validateForm = () => {
    if (!form.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!form.password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/teacher/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      
      const data = response.data;

      if (!data.token) {
        throw new Error("Invalid response from server");
      }

      // Use context login
      const loginSuccess = await login(
        {
          id: data.id,
          name: data.name,
          email: data.email,
          department: data.department
        },
        "TEACHER",
        data.token
      );

      if (loginSuccess) {
        console.log("✅ Login successful, redirecting...");
        navigate("/teacher/dashboard", { replace: true });
      } else {
        throw new Error("Failed to save login session");
      }
      
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle rate limiting
      if (err.status === 429) {
        setError(err.data?.message || "Too many attempts. Please try again later.");
        setRemainingAttempts(0);
      } else if (err.status === 401) {
        setError("Invalid email or password");
        setRemainingAttempts(err.data?.remainingAttempts);
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ 
        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
        padding: "2rem"
      }}
    >
      <div className="w-100" style={{ maxWidth: "420px" }}>

        {/* Logo */}
        <div className="text-center mb-4">
          <div 
            className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
            style={{ 
              width: "60px", 
              height: "60px",
              background: "linear-gradient(135deg, #10b981, #34d399)"
            }}
          >
            <span className="text-white fw-bold fs-4">T</span>
          </div>
          <h2 className="text-white fw-bold mb-1">Welcome Back</h2>
          <p className="text-white-50">Sign in to Teacher Panel</p>
        </div>

        {/* Login Card */}
        <div className="card shadow-lg border-0">
          <div className="card-body p-4">
            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Rate Limit Warning */}
            {remainingAttempts !== null && remainingAttempts <= 2 && remainingAttempts > 0 && (
              <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
                <AlertCircle size={18} />
                <span>{remainingAttempts} attempt(s) remaining</span>
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">
                  <Mail size={16} className="me-2" />
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">
                  <Lock size={16} className="me-2" />
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="py-2"
                />
              </Form.Group>

              <button
                type="submit"
                className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
                style={{ 
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  border: "none"
                }}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </Form>
          </div>
        </div>

        <p className="text-center text-white-50 mt-4 small">
          © {new Date().getFullYear()} Student Management System
        </p>
      </div>
    </div>
  );
}

export default TeacherLogin;