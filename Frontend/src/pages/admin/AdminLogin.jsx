// pages/admin/AdminLogin.jsx
import React, { useState, useEffect } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Lock, User, LogIn, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import "../../styles/AdminStyles.css";

function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && role === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ Make API call directly here
      const response = await api.post("/admin/login", form);
      const data = response.data;

      if (data.token) {
        // ✅ Use context login and wait for it
        const loginSuccess = await login(
          {
            username: data.username,
            id: data.id
          },
          "ADMIN",
          data.token
        );

        if (loginSuccess) {
          console.log("✅ Navigating to dashboard...");
          navigate("/admin/dashboard", { replace: true });
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ 
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
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
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)"
            }}
          >
            <span className="text-white fw-bold fs-4">A</span>
          </div>
          <h2 className="text-white fw-bold mb-1">Welcome Back</h2>
          <p className="text-secondary">Sign in to Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="card-modern p-4">
          {error && (
            <div className="alert-modern alert-danger-modern mb-4">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="form-label-modern">
                <User size={16} className="me-2" />
                Username
              </Form.Label>
              <Form.Control
                className="form-control-modern"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="form-label-modern">
                <Lock size={16} className="me-2" />
                Password
              </Form.Label>
              <Form.Control
                className="form-control-modern"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={loading}
              />
            </Form.Group>

            <button
              type="submit"
              className="btn btn-modern btn-primary-modern w-100"
              disabled={loading}
              style={{ padding: "0.875rem", justifyContent: "center" }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
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

        {/* Footer */}
        <p className="text-center text-secondary mt-4 small">
          © 2024 Student Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;