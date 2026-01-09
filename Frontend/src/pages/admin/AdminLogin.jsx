// src/Pages/admin/AdminLogin.jsx
import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { adminLogin } from "../../api/adminService";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await adminLogin(form);
      alert("✅ Login successful!");
      navigate("/admin/students/view");
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError("Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-4 text-primary">Admin Login</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Form>
    </Container>
  );
}

export default AdminLogin;
