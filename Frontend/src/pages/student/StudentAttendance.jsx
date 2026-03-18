import React, { useState, useEffect, useMemo } from "react";
import { Row, Col } from "react-bootstrap";
import { 
  ClipboardCheck, 
  Search, 
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { getMyAttendance, getAttendanceSummary } from "../../api/studentService";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import "../../styles/AdminStyles.css";

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
};

function StudentAttendance() {
  const { user } = useAuth();
  
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 30;

  // Summary
  const [summary, setSummary] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch attendance
  const fetchAttendance = async (page = 0) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      const [attendanceData, summaryData] = await Promise.all([
        getMyAttendance(user.id, page, pageSize),
        getAttendanceSummary(user.id).catch(() => null)
      ]);
      
      setAttendance(attendanceData.content || []);
      setTotalPages(attendanceData.totalPages || 1);
      setTotalItems(attendanceData.totalItems || 0);
      setCurrentPage(page);
      setSummary(summaryData);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAttendance(0);
    }
  }, [user?.id]);

  // Get unique subjects for filter
  const subjects = useMemo(() => {
    const subjectSet = new Set(attendance.map(a => a.subject));
    return Array.from(subjectSet).sort();
  }, [attendance]);

  // Filter attendance
  const filteredAttendance = useMemo(() => {
    let result = [...attendance];

    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(a =>
        a.subject?.toLowerCase().includes(search) ||
        a.remarks?.toLowerCase().includes(search)
      );
    }

    if (subjectFilter) {
      result = result.filter(a => a.subject === subjectFilter);
    }

    if (statusFilter) {
      const isPresent = statusFilter === "present";
      result = result.filter(a => a.isPresent === isPresent);
    }

    return result;
  }, [attendance, debouncedSearch, subjectFilter, statusFilter]);

  const handlePageChange = (page) => {
    fetchAttendance(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSubjectFilter("");
    setStatusFilter("");
    fetchAttendance(0);
  };

  // Get attendance status color
  const getStatusColor = (percentage) => {
    if (percentage >= 75) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="page-title">My Attendance</h1>
            <p className="page-subtitle">Track your class attendance records</p>
          </div>
          <button 
            className="btn btn-modern btn-secondary-modern" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert-modern alert-danger-modern mb-4">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <Row className="g-4 mb-4">
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-icon success">
                <CheckCircle size={24} />
              </div>
              <div className="stat-value">{summary.presentCount || 0}</div>
              <div className="stat-label">Present</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-icon danger">
                <XCircle size={24} />
              </div>
              <div className="stat-value">{summary.absentCount || 0}</div>
              <div className="stat-label">Absent</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-icon primary">
                <Calendar size={24} />
              </div>
              <div className="stat-value">{summary.totalRecords || 0}</div>
              <div className="stat-label">Total Classes</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className={`stat-icon ${getStatusColor(summary.attendancePercentage)}`}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-value">{summary.attendancePercentage?.toFixed(1) || 0}%</div>
              <div className="stat-label">Attendance</div>
            </div>
          </Col>
        </Row>
      )}

      {/* Attendance Warning */}
      {summary && summary.attendancePercentage < 75 && summary.totalRecords > 0 && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} />
          <div>
            <strong>Low Attendance Warning!</strong> Your attendance is {summary.attendancePercentage?.toFixed(1)}% 
            which is below the required 75%. You need to attend more classes to be eligible for exams.
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="card-modern mb-4">
        <div className="card-body-modern">
          <Row className="align-items-end g-3">
            <Col md={4}>
              <label className="form-label-modern mb-2">
                <Search size={16} className="me-2" />
                Search
              </label>
              <div className="position-relative">
                <Search 
                  size={18} 
                  className="position-absolute" 
                  style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} 
                />
                <input
                  type="text"
                  className="form-control-modern"
                  placeholder="Search by subject or remarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </Col>
            <Col md={4}>
              <label className="form-label-modern mb-2">
                <Filter size={16} className="me-2" />
                Subject
              </label>
              <select
                className="form-control-modern"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </Col>
            <Col md={4}>
              <label className="form-label-modern mb-2">
                <Filter size={16} className="me-2" />
                Status
              </label>
              <select
                className="form-control-modern"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Attendance Table */}
      {loading && attendance.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-modern"></div>
        </div>
      ) : filteredAttendance.length === 0 ? (
        <div className="card-modern text-center py-5">
          <ClipboardCheck size={48} className="text-muted mb-3" />
          <h5>No Attendance Records Found</h5>
          <p className="text-muted mb-0">
            {searchTerm || subjectFilter || statusFilter
              ? "Try adjusting your search or filters"
              : "Your attendance records will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="card-modern">
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th className="text-center">Status</th>
                    <th>Teacher</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Calendar size={16} className="text-muted" />
                          <span>{formatDate(record.date)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-modern badge-primary">
                          {record.subject}
                        </span>
                      </td>
                      <td className="text-center">
                        {record.isPresent ? (
                          <span className="badge bg-success d-inline-flex align-items-center gap-1">
                            <CheckCircle size={14} />
                            Present
                          </span>
                        ) : (
                          <span className="badge bg-danger d-inline-flex align-items-center gap-1">
                            <XCircle size={14} />
                            Absent
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-muted">
                          {record.teacher?.name || "-"}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {record.remarks || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      )}

      {/* Subject-wise Summary */}
      {summary?.subjectWise && Object.keys(summary.subjectWise).length > 0 && (
        <div className="card-modern mt-4">
          <div className="card-header-modern">
            <h5 className="mb-0">Subject-wise Attendance</h5>
          </div>
          <div className="card-body-modern">
            <Row className="g-3">
              {Object.entries(summary.subjectWise).map(([subject, data]) => (
                <Col xs={12} md={6} lg={4} key={subject}>
                  <div 
                    className="p-3 rounded border"
                    style={{ 
                      borderColor: data.percentage >= 75 ? "#10b981" : data.percentage >= 60 ? "#f59e0b" : "#ef4444",
                      background: data.percentage >= 75 
                        ? "rgba(16, 185, 129, 0.05)" 
                        : data.percentage >= 60 
                          ? "rgba(245, 158, 11, 0.05)" 
                          : "rgba(239, 68, 68, 0.05)"
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-medium">{subject}</span>
                      <span className={`badge bg-${getStatusColor(data.percentage)}`}>
                        {data.percentage?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div 
                        className={`progress-bar bg-${getStatusColor(data.percentage)}`}
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between mt-2 small text-muted">
                      <span>Present: {data.present}</span>
                      <span>Absent: {data.absent}</span>
                      <span>Total: {data.total}</span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentAttendance;