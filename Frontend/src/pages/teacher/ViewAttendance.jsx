// pages/teacher/ViewAttendance.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Row, Col } from "react-bootstrap";
import { 
  ClipboardCheck, 
  Search, 
  RefreshCw, 
  Filter, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  BookOpen
} from "lucide-react";
import { getAttendanceByTeacher } from "../../api/teacherService";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import "../../styles/AdminStyles.css";

// ✅ Helper function - defined here since it might not exist in utils
const formatDateReadable = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return date;
  }
};

function ViewAttendance() {
  const { user } = useAuth();
  
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  const debouncedSearch = useDebounce(searchTerm, 300);

  // ✅ Fetch attendance with proper response handling
  const fetchAttendance = useCallback(async (page = 0) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await getAttendanceByTeacher(user.id, page, pageSize);
      
      // Handle both array and paginated response
      if (Array.isArray(response)) {
        setAttendance(response);
        setTotalPages(1);
        setTotalItems(response.length);
      } else if (response && response.content) {
        setAttendance(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || response.totalElements || 0);
      } else {
        setAttendance([]);
        setTotalPages(1);
        setTotalItems(0);
      }
      
      setCurrentPage(page);
      
    } catch (err) {
      console.error("❌ Error fetching attendance:", err);
      setError(err.message || "Failed to load attendance records");
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, pageSize]);

  useEffect(() => {
    if (user?.id) {
      fetchAttendance(0);
    }
  }, [user?.id, fetchAttendance]);

  // ✅ Safe filtering
  const filteredAttendance = useMemo(() => {
    let attendanceArray = Array.isArray(attendance) ? attendance : [];

    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      attendanceArray = attendanceArray.filter(
        (record) =>
          record.student?.name?.toLowerCase().includes(search) ||
          record.student?.rollNo?.toLowerCase().includes(search) ||
          record.subject?.toLowerCase().includes(search) ||
          record.date?.includes(search)
      );
    }

    // Status filter
    if (statusFilter === "present") {
      attendanceArray = attendanceArray.filter(r => r.isPresent === true);
    } else if (statusFilter === "absent") {
      attendanceArray = attendanceArray.filter(r => r.isPresent === false);
    }

    // Subject filter
    if (subjectFilter) {
      attendanceArray = attendanceArray.filter(r => r.subject === subjectFilter);
    }

    return attendanceArray;
  }, [attendance, debouncedSearch, statusFilter, subjectFilter]);

  // ✅ Get unique subjects
  const subjects = useMemo(() => {
    const attendanceArray = Array.isArray(attendance) ? attendance : [];
    const unique = [...new Set(attendanceArray.map(a => a.subject).filter(Boolean))];
    return unique.sort();
  }, [attendance]);

  // ✅ Calculate stats
  const stats = useMemo(() => {
    const attendanceArray = Array.isArray(attendance) ? attendance : [];
    const present = attendanceArray.filter(a => a.isPresent === true).length;
    const absent = attendanceArray.length - present;
    const percentage = attendanceArray.length > 0 
      ? Math.round((present / attendanceArray.length) * 100) 
      : 0;
    return { present, absent, percentage };
  }, [attendance]);

  const handlePageChange = (page) => {
    fetchAttendance(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSubjectFilter("");
    fetchAttendance(0);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="page-title">Attendance Records</h1>
            <p className="page-subtitle">View all attendance marked by you</p>
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
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <ClipboardCheck size={24} />
            </div>
            <div className="stat-value">{totalItems}</div>
            <div className="stat-label">Total Records</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-value">{stats.present}</div>
            <div className="stat-label">Present</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              <XCircle size={24} />
            </div>
            <div className="stat-value">{stats.absent}</div>
            <div className="stat-label">Absent</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon warning">
              <Calendar size={24} />
            </div>
            <div className="stat-value">{stats.percentage}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </Col>
      </Row>

      {/* Search & Filter Bar */}
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
                  placeholder="Search by name, roll no, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                />
              </div>
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
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </Col>

            <Col md={4}>
              <label className="form-label-modern mb-2">
                <BookOpen size={16} className="me-2" />
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
          </Row>
        </div>
      </div>

      {/* Loading State */}
      {loading && attendance.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-modern"></div>
        </div>
      ) : filteredAttendance.length === 0 ? (
        <div className="card-modern text-center py-5">
          <ClipboardCheck size={48} className="text-muted mb-3" />
          <h5>No Attendance Records Found</h5>
          <p className="text-muted">
            {searchTerm || statusFilter || subjectFilter
              ? "Try adjusting your search or filters" 
              : "Start by marking attendance for students"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-modern d-none d-md-block">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <AttendanceRow key={record.id} record={record} />
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none">
            <Row className="g-3">
              {filteredAttendance.map((record) => (
                <Col xs={12} key={record.id}>
                  <AttendanceCard record={record} />
                </Col>
              ))}
            </Row>
          </div>

          {/* Pagination */}
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
    </div>
  );
}

// ✅ Memoized Row Component
const AttendanceRow = React.memo(({ record }) => (
  <tr>
    <td>
      <div className="d-flex align-items-center gap-2">
        <Calendar size={14} className="text-muted" />
        <span className="fw-medium">{formatDateReadable(record.date)}</span>
      </div>
    </td>
    <td>
      <span className="badge-modern badge-primary">
        {record.student?.rollNo || "N/A"}
      </span>
    </td>
    <td>
      <div className="d-flex align-items-center gap-2">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
          style={{ 
            width: "32px", 
            height: "32px", 
            fontSize: "0.8rem",
            background: "linear-gradient(135deg, #10b981, #059669)"
          }}
        >
          {record.student?.name?.charAt(0).toUpperCase() || "S"}
        </div>
        <span className="fw-medium">{record.student?.name || "Unknown"}</span>
      </div>
    </td>
    <td>
      <span className="badge-modern badge-info">
        {record.subject}
      </span>
    </td>
    <td>
      {record.isPresent ? (
        <span className="attendance-present">
          <CheckCircle size={14} />
          Present
        </span>
      ) : (
        <span className="attendance-absent">
          <XCircle size={14} />
          Absent
        </span>
      )}
    </td>
    <td className="text-muted small">{record.remarks || "-"}</td>
  </tr>
));

AttendanceRow.displayName = "AttendanceRow";

// ✅ Memoized Card Component (Mobile)
const AttendanceCard = React.memo(({ record }) => (
  <div className="card-modern">
    <div className="card-body-modern">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
            style={{ 
              width: "40px", 
              height: "40px", 
              fontSize: "1rem",
              background: "linear-gradient(135deg, #10b981, #059669)"
            }}
          >
            {record.student?.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{record.student?.name || "Unknown"}</h6>
            <span className="badge-modern badge-primary small">{record.student?.rollNo}</span>
          </div>
        </div>
        {record.isPresent ? (
          <span className="attendance-present">
            <CheckCircle size={14} />
            Present
          </span>
        ) : (
          <span className="attendance-absent">
            <XCircle size={14} />
            Absent
          </span>
        )}
      </div>
      
      <div className="d-flex flex-wrap gap-3 text-muted small">
        <div className="d-flex align-items-center gap-1">
          <Calendar size={14} />
          {formatDateReadable(record.date)}
        </div>
        <div className="d-flex align-items-center gap-1">
          <BookOpen size={14} />
          {record.subject}
        </div>
      </div>
      
      {record.remarks && (
        <div className="mt-2 pt-2 border-top text-muted small">
          <strong>Remarks:</strong> {record.remarks}
        </div>
      )}
    </div>
  </div>
));

AttendanceCard.displayName = "AttendanceCard";

export default ViewAttendance;