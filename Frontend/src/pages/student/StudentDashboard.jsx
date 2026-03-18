import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  ClipboardCheck, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award,
  AlertCircle,
  ChevronRight,
  FileText,
  Download,
  CheckCircle,
  XCircle
} from "lucide-react";
import { getStudentDashboardStats, getCurrentCGPA } from "../../api/studentService";
import { useAuth } from "../../context/AuthContext";

function StudentDashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalAttendanceRecords: 0,
    presentCount: 0,
    absentCount: 0,
    attendancePercentage: 0,
    totalMarksRecords: 0,
    currentCGPA: 0
  });
  const [cgpaData, setCgpaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const [statsData, cgpa] = await Promise.all([
          getStudentDashboardStats(user.id),
          getCurrentCGPA(user.id).catch(() => null)
        ]);
        
        if (isMounted) {
          setStats(statsData);
          setCgpaData(cgpa);
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

    fetchData();
    
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

  // Determine attendance status
  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) return { text: "Good", color: "success" };
    if (percentage >= 60) return { text: "Warning", color: "warning" };
    return { text: "Critical", color: "danger" };
  };

  const attendanceStatus = getAttendanceStatus(stats.attendancePercentage);

  // Determine CGPA status
  const getCGPAStatus = (cgpa) => {
    if (cgpa >= 8) return { text: "Excellent", color: "success" };
    if (cgpa >= 6) return { text: "Good", color: "primary" };
    if (cgpa >= 5) return { text: "Average", color: "warning" };
    return { text: "Needs Improvement", color: "danger" };
  };

  const cgpaStatus = getCGPAStatus(stats.currentCGPA);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-warning" role="status">
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
          <h1 className="h3 fw-bold mb-1">Welcome, {user?.name || "Student"}! 👋</h1>
          <p className="text-muted mb-0">
            <span className="badge bg-warning-subtle text-warning me-2">{user?.rollNo}</span>
            {user?.department && <span className="text-muted">{user.department}</span>}
          </p>
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
                  style={{ background: "rgba(245, 158, 11, 0.1)" }}
                >
                  <Award size={24} className="text-warning" />
                </div>
                <span className={`badge bg-${cgpaStatus.color}-subtle text-${cgpaStatus.color}`}>
                  {cgpaStatus.text}
                </span>
              </div>
              <h3 className="fw-bold mb-1">{stats.currentCGPA?.toFixed(2) || "0.00"}</h3>
              <p className="text-muted small mb-0">Current CGPA</p>
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
                <span className={`badge bg-${attendanceStatus.color}-subtle text-${attendanceStatus.color}`}>
                  {attendanceStatus.text}
                </span>
              </div>
              <h3 className="fw-bold mb-1">{stats.attendancePercentage?.toFixed(1) || 0}%</h3>
              <p className="text-muted small mb-0">Attendance</p>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div 
                  className="p-2 rounded"
                  style={{ background: "rgba(59, 130, 246, 0.1)" }}
                >
                  <BookOpen size={24} className="text-primary" />
                </div>
                <span className="badge bg-primary-subtle text-primary">Records</span>
              </div>
              <h3 className="fw-bold mb-1">{stats.totalMarksRecords}</h3>
              <p className="text-muted small mb-0">Exam Entries</p>
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
                  Semesters
                </span>
              </div>
              <h3 className="fw-bold mb-1">{cgpaData?.completedSemesters || 0}</h3>
              <p className="text-muted small mb-0">Completed</p>
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
                  to="/student/marks" 
                  className="btn btn-warning d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <BookOpen size={18} />
                    View My Marks
                  </span>
                  <ChevronRight size={18} />
                </Link>
                
                <Link 
                  to="/student/attendance" 
                  className="btn btn-outline-success d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <ClipboardCheck size={18} />
                    View Attendance
                  </span>
                  <ChevronRight size={18} />
                </Link>
                
                <Link 
                  to="/student/cgpa" 
                  className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <TrendingUp size={18} />
                    CGPA Prediction
                  </span>
                  <ChevronRight size={18} />
                </Link>

                <Link 
                  to="/student/materials" 
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <FileText size={18} />
                    Study Materials
                  </span>
                  <ChevronRight size={18} />
                </Link>

                <Link 
                  to="/student/reports" 
                  className="btn btn-outline-dark d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <Download size={18} />
                    Download Reports
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
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    fontSize: "1.5rem"
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || "S"}
                </div>
                <div>
                  <h5 className="mb-1">{user?.name || "Student"}</h5>
                  <p className="text-muted mb-0 small">{user?.email}</p>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Roll Number</span>
                  <span className="badge bg-warning-subtle text-warning">
                    {user?.rollNo || "N/A"}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Department</span>
                  <span className="badge bg-primary-subtle text-primary">
                    {user?.department || "N/A"}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Course</span>
                  <span className="fw-medium">{user?.course || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Role</span>
                  <span className="badge bg-warning-subtle text-warning">Student</span>
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
              <h5 className="fw-bold mb-0">Attendance Overview</h5>
            </div>
            <div className="card-body">
              <Row className="g-3">
                <Col xs={6} md={3}>
                  <div className="text-center p-3 rounded" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                    <CheckCircle size={24} className="text-success mb-2" />
                    <div className="h4 fw-bold text-success mb-1">{stats.presentCount}</div>
                    <small className="text-muted">Present</small>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center p-3 rounded" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                    <XCircle size={24} className="text-danger mb-2" />
                    <div className="h4 fw-bold text-danger mb-1">{stats.absentCount}</div>
                    <small className="text-muted">Absent</small>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center p-3 rounded" style={{ background: "rgba(59, 130, 246, 0.1)" }}>
                    <ClipboardCheck size={24} className="text-primary mb-2" />
                    <div className="h4 fw-bold text-primary mb-1">{stats.totalAttendanceRecords}</div>
                    <small className="text-muted">Total Classes</small>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center p-3 rounded" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                    <TrendingUp size={24} className="text-warning mb-2" />
                    <div className="h4 fw-bold text-warning mb-1">{stats.attendancePercentage?.toFixed(1)}%</div>
                    <small className="text-muted">Percentage</small>
                  </div>
                </Col>
              </Row>

              {/* Attendance Warning */}
              {stats.attendancePercentage < 75 && stats.totalAttendanceRecords > 0 && (
                <div className="alert alert-warning d-flex align-items-center gap-2 mt-3 mb-0">
                  <AlertCircle size={20} />
                  <span>
                    Your attendance is below 75%. Maintain at least 75% attendance to be eligible for exams.
                  </span>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default StudentDashboard;