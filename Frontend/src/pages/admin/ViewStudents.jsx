// pages/admin/ViewStudents.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Row, Col } from "react-bootstrap";
import { Users, Search, RefreshCw, Filter } from "lucide-react";
import { getStudents } from "../../api/adminService";
import { useDebounce } from "../../hooks/useDebounce";
import "../../styles/AdminStyles.css";

function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 300);

  // ✅ FIXED: Fetch students with proper error handling
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getStudents();
      
      // ✅ Ensure we always have an array
      const studentArray = Array.isArray(data) ? data : [];
      setStudents(studentArray);
      
      console.log("✅ Students loaded:", studentArray.length);
    } catch (err) {
      console.error("❌ Error fetching students:", err);
      setError(err.message || "Failed to fetch students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ✅ FIXED: Safe filtering with Array check
  const filteredStudents = useMemo(() => {
    let studentArray = Array.isArray(students) ? students : [];

    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      studentArray = studentArray.filter(
        (student) =>
          student.name?.toLowerCase().includes(search) ||
          student.email?.toLowerCase().includes(search) ||
          student.rollNo?.toLowerCase().includes(search) ||
          student.department?.toLowerCase().includes(search)
      );
    }

    // Department filter
    if (departmentFilter) {
      studentArray = studentArray.filter(s => s.department === departmentFilter);
    }

    return studentArray;
  }, [students, debouncedSearch, departmentFilter]);

  // ✅ Get unique departments safely
  const departments = useMemo(() => {
    const studentArray = Array.isArray(students) ? students : [];
    const unique = [...new Set(studentArray.map(s => s.department).filter(Boolean))];
    return unique.sort();
  }, [students]);

  const handleRefresh = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    fetchStudents();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="page-title">Students</h1>
            <p className="page-subtitle">Manage all students in the system</p>
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

      {/* Search & Filter Bar */}
      <div className="card-modern mb-4">
        <div className="card-body-modern">
          <Row className="align-items-end g-3">
            <Col md={4}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Users size={20} style={{ color: "#6366f1" }} />
                <span className="fw-bold">{filteredStudents.length}</span>
                <span className="text-muted">Total Students</span>
              </div>
            </Col>
            
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
                  placeholder="Search by name, email, roll no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </Col>

            <Col md={4}>
              <label className="form-label-modern mb-2">
                <Filter size={16} className="me-2" />
                Filter by Department
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
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-modern"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card-modern text-center py-5">
          <Users size={48} className="text-muted mb-3" />
          <h5>No Students Found</h5>
          <p className="text-muted">
            {searchTerm || departmentFilter 
              ? "Try adjusting your search or filter" 
              : "Start by adding a new student"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-modern d-none d-md-block">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <StudentRow 
                    key={student.id} 
                    student={student} 
                    index={index + 1}
                  />
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none">
            <Row className="g-3">
              {filteredStudents.map((student) => (
                <Col xs={12} key={student.id}>
                  <StudentCard student={student} />
                </Col>
              ))}
            </Row>
          </div>
        </>
      )}
    </div>
  );
}

// ✅ Memoized Row Component
const StudentRow = React.memo(({ student, index }) => (
  <tr>
    <td>{index}</td>
    <td>
      <span className="badge-modern badge-primary">
        {student.rollNo}
      </span>
    </td>
    <td>
      <div className="d-flex align-items-center gap-2">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
          style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}
        >
          {student.name?.charAt(0).toUpperCase() || "S"}
        </div>
        <span className="fw-medium">{student.name || "Unknown"}</span>
      </div>
    </td>
    <td className="text-muted">{student.email || "N/A"}</td>
    <td>
      <span className="badge-modern badge-success">
        {student.department || "N/A"}
      </span>
    </td>
    <td>{student.course || "N/A"}</td>
    <td>{student.phone || "N/A"}</td>
  </tr>
));

StudentRow.displayName = "StudentRow";

// ✅ Memoized Card Component
const StudentCard = React.memo(({ student }) => (
  <div className="card-modern">
    <div className="card-body-modern">
      <div className="d-flex align-items-start gap-3 mb-3">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
          style={{ width: "48px", height: "48px", fontSize: "1.2rem" }}
        >
          {student.name?.charAt(0).toUpperCase() || "S"}
        </div>
        <div className="flex-grow-1">
          <h6 className="mb-1 fw-bold">{student.name || "Unknown"}</h6>
          <span className="badge-modern badge-primary">{student.rollNo}</span>
        </div>
      </div>
      <div className="small">
        <div className="mb-2">
          <strong>Email:</strong> {student.email || "N/A"}
        </div>
        <div className="mb-2">
          <strong>Department:</strong>{" "}
          <span className="badge-modern badge-success">
            {student.department || "N/A"}
          </span>
        </div>
        <div className="mb-2">
          <strong>Course:</strong> {student.course || "N/A"}
        </div>
        <div>
          <strong>Phone:</strong> {student.phone || "N/A"}
        </div>
      </div>
    </div>
  </div>
));

StudentCard.displayName = "StudentCard";

export default ViewStudents;