// pages/teacher/TeacherDashboard.jsx
import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { 
  Users, 
  ClipboardCheck, 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { getTeacherDashboardStats } from "../../api/teacherService";
import { useAuth } from "../../context/AuthContext";
import { formatDateReadable } from "../../utils/helpers";

function TeacherDashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttendanceRecords: 0,
    totalMarksRecords: 0,
    uniqueDaysMarked: 0,
    presentCount: 0,
    absentCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await getTeacherDashboardStats(user.id);
        if (isMounted) {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Dashboard error:", err);
          setError(err.message || "Failed to load dashboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate attendance percentage
  const attendancePercentage = stats.presentCount + stats.absentCount > 0
    ? Math.round((stats.presentCount / (stats.presentCount + stats.absentCount)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Welcome, {user?.name || "Teacher"}! 👋</h1>
          <p className="text-muted mb-0">Here's your teaching overview</p>
        </div>
        <div className="text-end">
          <div className="d-flex align-items-center gap-2 text-muted mb-1 small">
            <Calendar size={14} />
            <span>{currentDate}</span>
          </div>
          <div className="d-flex align-items-center gap-2 text-muted small">
            <Clock size={14} />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div 
                  className="p-2 rounded"
                  style={{ background: "rgba(59, 130, 246, 0.1)" }}
                >
                  <Users size={24} className="text-primary" />
                </div>
                <span className="badge bg-primary-subtle text-primary">Total</span>
              </div>
              <h3 className="fw-bold mb-1">{stats.totalStudents}</h3>
              <p className="text-muted small mb-0">Students</p>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div 
                  className="p-2 rounded"
                  style={{ background: "rgba(16, 185, 129, 0.1)" }}
                >
                  <ClipboardCheck size={24} className="text-success" />
                </div>
                <span className="badge bg-success-subtle text-success">Records</span>
              </div>
              <h3 className="fw-bold mb-1">{stats.totalAttendanceRecords}</h3>
              <p className="text-muted small mb-0">Attendance Entries</p>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div 
                  className="p-2 rounded"
                  style={{ background: "rgba(245, 158, 11, 0.1)" }}
                >
                  <BookOpen size={24} className="text-warning" />
                </div>
                <span className="badge bg-warning-subtle text-warning">Records</span>
              </div>
              <h3 className="fw-bold mb-1">{stats.totalMarksRecords}</h3>
              <p className="text-muted small mb-0">Marks Entries</p>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div 
                  className="p-2 rounded"
                  style={{ background: "rgba(139, 92, 246, 0.1)" }}
                >
                  <TrendingUp size={24} style={{ color: "#8b5cf6" }} />
                </div>
                <span 
                  className="badge"
                  style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}
                >
                  Percentage
                </span>
              </div>
              <h3 className="fw-bold mb-1">{attendancePercentage}%</h3>
              <p className="text-muted small mb-0">Overall Attendance</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Actions & Profile */}
      <Row className="g-4">
        <Col xs={12} md={6}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="fw-bold mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link 
                  to="/teacher/attendance/mark" 
                  className="btn btn-success d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <ClipboardCheck size={18} />
                    Mark Attendance
                  </span>
                  <ChevronRight size={18} />
                </Link>
                
                <Link 
                  to="/teacher/marks/add" 
                  className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <BookOpen size={18} />
                    Add Marks
                  </span>
                  <ChevronRight size={18} />
                </Link>
                
                <Link 
                  to="/teacher/students" 
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <Users size={18} />
                    View Students
                  </span>
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} md={6}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="fw-bold mb-0">Your Profile</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    fontSize: "1.5rem"
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || "T"}
                </div>
                <div>
                  <h5 className="mb-1">{user?.name || "Teacher"}</h5>
                  <p className="text-muted mb-0 small">{user?.email}</p>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Department</span>
                  <span className="badge bg-success-subtle text-success">
                    {user?.department || "N/A"}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Role</span>
                  <span className="badge bg-primary-subtle text-primary">Teacher</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Days Active</span>
                  <span className="fw-medium">{stats.uniqueDaysMarked}</span>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Attendance Summary */}
      <Row className="g-4 mt-2">
        <Col xs={12}>
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="fw-bold mb-0">Attendance Summary</h5>
            </div>
            <div className="card-body">
              <Row className="g-3">
                <Col xs={6} md={3}>
                  <div className="text-center p-3 rounded" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                    <div className="h4 fw-bold text-success mb-1">{stats.presentCount}</div>
                    <small className="text-muted">Present</small>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center p-3 rounded" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                    <div className="h4 fw-bold text-danger mb-1">{stats.absentCount}</div>
                    <small className="text-muted">Absent</small>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center p-3 rounded" style={{ background: "rgba(59, 130, 246, 0.1)" }}>
                    <div className="h4 fw-bold text-primary mb-1">{stats.totalAttendanceRecords}</div>
                    <small className="text-muted">Total Records</small>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center p-3 rounded" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
                    <div className="h4 fw-bold" style={{ color: "#8b5cf6" }}>{stats.uniqueDaysMarked}</div>
                    <small className="text-muted">Days Marked</small>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default TeacherDashboard;