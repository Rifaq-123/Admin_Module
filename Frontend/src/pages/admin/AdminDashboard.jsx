// pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Table } from "react-bootstrap";
import { 
  Users, 
  GraduationCap, 
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  UserPlus,
  Eye,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { getDashboardStats, getStudents, getTeachers } from "../../api/adminService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AdminStyles.css";

function AdminDashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsData = await getDashboardStats();
        setStats(statsData);

        // Fetch recent students (last 5)
        const studentsData = await getStudents();
        const studentArray = Array.isArray(studentsData) ? studentsData : [];
        setRecentStudents(studentArray.slice(-5).reverse());

        // Fetch recent teachers (last 5)
        const teachersData = await getTeachers();
        const teacherArray = Array.isArray(teachersData) ? teachersData : [];
        setRecentTeachers(teacherArray.slice(-5).reverse());

      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ Memoized calculations
  const totalUsers = useMemo(() => {
    return stats.totalStudents + stats.totalTeachers;
  }, [stats.totalStudents, stats.totalTeachers]);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-modern"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-modern alert-danger-modern">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="page-title">{greeting}, {user?.username || "Admin"}! 👋</h1>
            <p className="page-subtitle">Here's what's happening in your institution today.</p>
          </div>
          <div className="text-end">
            <div className="d-flex align-items-center gap-2 text-muted mb-1">
              <Calendar size={16} />
              <span className="small">{currentDate}</span>
            </div>
            <div className="d-flex align-items-center gap-2 text-muted">
              <Clock size={16} />
              <span className="small">{currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <Users size={24} />
            </div>
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-label">Total Students</div>
            <div className="mt-2">
              <span className="text-success small d-flex align-items-center gap-1">
                <ArrowUpRight size={14} />
                Enrolled
              </span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className="stat-icon success">
              <GraduationCap size={24} />
            </div>
            <div className="stat-value">{stats.totalTeachers}</div>
            <div className="stat-label">Total Teachers</div>
            <div className="mt-2">
              <span className="text-success small d-flex align-items-center gap-1">
                <ArrowUpRight size={14} />
                Active Faculty
              </span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className="stat-icon warning">
              <BarChart3 size={24} />
            </div>
            <div className="stat-value">{totalUsers}</div>
            <div className="stat-label">Total Users</div>
            <div className="mt-2">
              <span className="text-muted small">Students + Teachers</span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className="stat-icon info">
              <Activity size={24} />
            </div>
            <div className="stat-value">{new Date().getFullYear()}</div>
            <div className="stat-label">Academic Year</div>
            <div className="mt-2">
              <span className="text-muted small">Current Session</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Actions & Recent Students */}
      <Row className="g-4 mb-4">
        {/* Quick Actions */}
        <Col xs={12} lg={4}>
          <div className="card-modern h-100">
            <div className="card-header-modern">
              <span>⚡ Quick Actions</span>
            </div>
            <div className="card-body-modern">
              <div className="d-grid gap-2">
                <a href="/admin/students/add" className="btn btn-modern btn-primary-modern">
                  <UserPlus size={18} />
                  Add New Student
                </a>
                <a href="/admin/teachers/add" className="btn btn-modern btn-secondary-modern">
                  <UserPlus size={18} />
                  Add New Teacher
                </a>
                <a href="/admin/students/view" className="btn btn-modern btn-secondary-modern">
                  <Eye size={18} />
                  View All Students
                </a>
                <a href="/admin/teachers/view" className="btn btn-modern btn-secondary-modern">
                  <Eye size={18} />
                  View All Teachers
                </a>
              </div>
            </div>
          </div>
        </Col>

        {/* Recent Students */}
        <Col xs={12} lg={8}>
          <div className="card-modern h-100">
            <div className="card-header-modern">
              <span>🎓 Recently Added Students</span>
              <a href="/admin/students/view" className="text-primary small text-decoration-none">
                View All →
              </a>
            </div>
            <div className="card-body-modern p-0">
              {recentStudents.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <Users size={40} className="mb-3 opacity-50" />
                  <p className="mb-0">No students added yet</p>
                  <a href="/admin/students/add" className="btn btn-sm btn-primary mt-3">
                    Add First Student
                  </a>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Course</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentStudents.map((student) => (
                        <tr key={student.id}>
                          <td>
                            <span className="badge-modern badge-primary">
                              {student.rollNo}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                  fontSize: "0.8rem"
                                }}
                              >
                                {student.name?.charAt(0).toUpperCase() || "S"}
                              </div>
                              <span className="fw-medium">{student.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge-modern badge-success">
                              {student.department || "N/A"}
                            </span>
                          </td>
                          <td className="text-muted">{student.course || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Recent Teachers */}
      <Row className="g-4">
        <Col xs={12}>
          <div className="card-modern">
            <div className="card-header-modern">
              <span>👨‍🏫 Recently Added Teachers</span>
              <a href="/admin/teachers/view" className="text-primary small text-decoration-none">
                View All →
              </a>
            </div>
            <div className="card-body-modern">
              {recentTeachers.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <GraduationCap size={40} className="mb-3 opacity-50" />
                  <p className="mb-0">No teachers added yet</p>
                  <a href="/admin/teachers/add" className="btn btn-sm btn-success mt-3">
                    Add First Teacher
                  </a>
                </div>
              ) : (
                <Row className="g-3">
                  {recentTeachers.map((teacher) => (
                    <Col xs={12} sm={6} md={4} lg={3} xl={2} key={teacher.id}>
                      <div className="teacher-mini-card">
                        <div
                          className="teacher-avatar"
                          style={{
                            background: "linear-gradient(135deg, #10b981, #059669)"
                          }}
                        >
                          {teacher.name?.charAt(0).toUpperCase() || "T"}
                        </div>
                        <div className="teacher-info">
                          <h6 className="mb-0 text-truncate">{teacher.name}</h6>
                          <small className="text-muted text-truncate d-block">
                            {teacher.department || "N/A"}
                          </small>
                          <span className="badge-modern badge-success mt-1" style={{ fontSize: "0.65rem" }}>
                            {teacher.subject || "N/A"}
                          </span>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* System Info Footer */}
      <Row className="g-4 mt-2">
        <Col xs={12}>
          <div className="system-info-bar">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-4">
                <span className="text-muted small">
                  📊 System Status: <span className="text-success fw-medium">Online</span>
                </span>
                <span className="text-muted small">
                  🔄 Last Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <span className="text-muted small">
                © {new Date().getFullYear()} Student Management System v1.0
              </span>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard;