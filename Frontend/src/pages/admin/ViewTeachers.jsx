// pages/admin/ViewTeachers.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import { GraduationCap, Search, RefreshCw, Mail, Phone, Award, Filter } from "lucide-react";
import { getTeachers, getTeachersPaginated } from "../../api/adminService";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import "../../styles/AdminStyles.css";

function ViewTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  const debouncedSearch = useDebounce(searchTerm, 300);

  // ✅ FIXED: Fetch teachers with proper response handling
  const fetchTeachers = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);

    try {
      // Try paginated endpoint first
      const response = await getTeachersPaginated(page, pageSize, "name", "asc");
      
      // ✅ Handle both array and paginated response
      if (Array.isArray(response)) {
        setTeachers(response);
        setTotalPages(1);
        setTotalItems(response.length);
      } else if (response && response.content) {
        setTeachers(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || response.totalElements || 0);
      } else {
        // Fallback: response might be directly an array
        const teacherArray = Array.isArray(response) ? response : [];
        setTeachers(teacherArray);
        setTotalPages(1);
        setTotalItems(teacherArray.length);
      }
      
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      
      // ✅ Fallback to non-paginated endpoint
      try {
        const fallbackData = await getTeachers();
        const teacherArray = Array.isArray(fallbackData) ? fallbackData : [];
        setTeachers(teacherArray);
        setTotalPages(1);
        setTotalItems(teacherArray.length);
        setCurrentPage(0);
      } catch (fallbackErr) {
        setError(fallbackErr.message || "Failed to fetch teachers");
        setTeachers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchTeachers(0);
  }, [fetchTeachers]);

  // ✅ FIXED: Safe filtering with Array check
  const filteredTeachers = useMemo(() => {
    // Ensure teachers is an array
    let teacherArray = Array.isArray(teachers) ? teachers : [];

    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      teacherArray = teacherArray.filter(
        (teacher) =>
          teacher.name?.toLowerCase().includes(search) ||
          teacher.email?.toLowerCase().includes(search) ||
          teacher.department?.toLowerCase().includes(search) ||
          teacher.subject?.toLowerCase().includes(search)
      );
    }

    // Department filter
    if (departmentFilter) {
      teacherArray = teacherArray.filter(t => t.department === departmentFilter);
    }

    return teacherArray;
  }, [teachers, debouncedSearch, departmentFilter]);

  // ✅ Get unique departments (with safety check)
  const departments = useMemo(() => {
    const teacherArray = Array.isArray(teachers) ? teachers : [];
    const unique = [...new Set(teacherArray.map(t => t.department).filter(Boolean))];
    return unique.sort();
  }, [teachers]);

  const handlePageChange = (page) => {
    fetchTeachers(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    fetchTeachers(0);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="page-title">Teachers</h1>
            <p className="page-subtitle">Manage all teachers in the system</p>
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

      {/* Error */}
      {error && (
        <div className="alert-modern alert-danger-modern mb-4">
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="card-modern mb-4">
        <div className="card-body-modern">
          <Row className="align-items-end g-3">
            <Col md={4}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <GraduationCap size={20} className="text-success" />
                <span className="fw-bold">{totalItems}</span>
                <span className="text-muted">Total Teachers</span>
              </div>
            </Col>

            <Col md={4}>
              <label className="form-label-modern mb-2">
                <Search size={16} className="me-2" />
                Search
              </label>
              <div className="position-relative">
                <Search size={18} className="position-absolute" style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  className="form-control-modern"
                  placeholder="Search by name, email, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </Col>

            <Col md={4}>
              <label className="form-label-modern mb-2">
                <Filter size={16} className="me-2" />
                Department
              </label>
              <select
                className="form-control-modern"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Loading */}
      {loading && teachers.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-modern"></div>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="card-modern text-center py-5">
          <GraduationCap size={48} className="text-muted mb-3" />
          <h5>No Teachers Found</h5>
          <p className="text-muted">
            {searchTerm ? "Try adjusting your search" : "Start by adding a new teacher"}
          </p>
        </div>
      ) : (
        <>
          {/* Teachers Grid */}
          <Row className="g-4 mb-4">
            {filteredTeachers.map((teacher) => (
              <Col xs={12} sm={6} md={4} lg={3} key={teacher.id}>
                <TeacherCard teacher={teacher} />
              </Col>
            ))}
          </Row>

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

// ✅ Memoized Teacher Card
const TeacherCard = React.memo(({ teacher }) => (
  <div className="card-modern h-100">
    <div className="card-body-modern">
      {/* Avatar & Name */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            fontSize: "1.2rem",
            flexShrink: 0
          }}
        >
          {teacher.name?.charAt(0).toUpperCase() || "T"}
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <h6 className="mb-0 fw-bold text-truncate">{teacher.name || "Unknown"}</h6>
          <span className="badge-modern badge-success">{teacher.department || "N/A"}</span>
        </div>
      </div>

      {/* Details */}
      <div className="d-flex flex-column gap-2 mb-3">
        <div className="d-flex align-items-center gap-2 text-muted small">
          <Mail size={14} />
          <span className="text-truncate">{teacher.email || "N/A"}</span>
        </div>

        <div className="d-flex align-items-center gap-2 text-muted small">
          <Phone size={14} />
          <span>{teacher.phone || "N/A"}</span>
        </div>

        <div className="d-flex align-items-center gap-2 text-muted small">
          <Award size={14} />
          <span className="text-truncate">{teacher.subject || "N/A"}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-top d-flex justify-content-between align-items-center">
        <div>
          <small className="text-muted d-block">Experience</small>
          <span className="fw-semibold">{teacher.experience || 0} yrs</span>
        </div>
        <div className="text-end">
          <small className="text-muted d-block">Qualification</small>
          <span className="fw-semibold small">{teacher.qualification || "N/A"}</span>
        </div>
      </div>
    </div>
  </div>
));

TeacherCard.displayName = "TeacherCard";

export default ViewTeachers;