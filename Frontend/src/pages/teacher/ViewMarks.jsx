// pages/teacher/ViewMarks.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Table, Row, Col } from "react-bootstrap";
import { 
  BookOpen, 
  Search, 
  RefreshCw, 
  Filter,
  Award,
  TrendingUp,
  User,
  FileText
} from "lucide-react";
import { getMarksByTeacher } from "../../api/teacherService";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import "../../styles/AdminStyles.css";

function ViewMarks() {
  const { user } = useAuth();
  
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  const debouncedSearch = useDebounce(searchTerm, 300);

  // ✅ Fetch marks with proper response handling
  const fetchMarks = useCallback(async (page = 0) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await getMarksByTeacher(user.id, page, pageSize);
      
      // Handle both array and paginated response
      if (Array.isArray(response)) {
        setMarks(response);
        setTotalPages(1);
        setTotalItems(response.length);
      } else if (response && response.content) {
        setMarks(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || response.totalElements || 0);
      } else {
        setMarks([]);
        setTotalPages(1);
        setTotalItems(0);
      }
      
      setCurrentPage(page);
      
    } catch (err) {
      console.error("❌ Error fetching marks:", err);
      setError(err.message || "Failed to load marks records");
      setMarks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, pageSize]);

  useEffect(() => {
    if (user?.id) {
      fetchMarks(0);
    }
  }, [user?.id, fetchMarks]);

  // ✅ Safe filtering
  const filteredMarks = useMemo(() => {
    let marksArray = Array.isArray(marks) ? marks : [];

    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      marksArray = marksArray.filter(
        (record) =>
          record.student?.name?.toLowerCase().includes(search) ||
          record.student?.rollNo?.toLowerCase().includes(search) ||
          record.subject?.toLowerCase().includes(search)
      );
    }

    // Subject filter
    if (subjectFilter) {
      marksArray = marksArray.filter(r => r.subject === subjectFilter);
    }

    // Exam type filter
    if (examFilter) {
      marksArray = marksArray.filter(r => r.examType === examFilter);
    }

    // Semester filter
    if (semesterFilter) {
      marksArray = marksArray.filter(r => r.semester === parseInt(semesterFilter));
    }

    return marksArray;
  }, [marks, debouncedSearch, subjectFilter, examFilter, semesterFilter]);

  // ✅ Get unique values for filters
  const { subjects, examTypes, semesters } = useMemo(() => {
    const marksArray = Array.isArray(marks) ? marks : [];
    return {
      subjects: [...new Set(marksArray.map(m => m.subject).filter(Boolean))].sort(),
      examTypes: [...new Set(marksArray.map(m => m.examType).filter(Boolean))].sort(),
      semesters: [...new Set(marksArray.map(m => m.semester).filter(Boolean))].sort((a, b) => a - b)
    };
  }, [marks]);

  // ✅ Calculate stats
  const stats = useMemo(() => {
    const marksArray = Array.isArray(marks) ? marks : [];
    const totalRecords = marksArray.length;
    const avgPercentage = totalRecords > 0
      ? Math.round(marksArray.reduce((sum, m) => sum + (m.marksObtained / m.totalMarks * 100), 0) / totalRecords)
      : 0;
    const uniqueStudents = new Set(marksArray.map(m => m.student?.id)).size;
    const uniqueSubjects = new Set(marksArray.map(m => m.subject)).size;
    
    return { totalRecords, avgPercentage, uniqueStudents, uniqueSubjects };
  }, [marks]);

  const handlePageChange = (page) => {
    fetchMarks(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSubjectFilter("");
    setExamFilter("");
    setSemesterFilter("");
    fetchMarks(0);
  };

  // Helper function for grade
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: "success" };
    if (percentage >= 80) return { grade: "A", color: "success" };
    if (percentage >= 70) return { grade: "B+", color: "info" };
    if (percentage >= 60) return { grade: "B", color: "info" };
    if (percentage >= 50) return { grade: "C", color: "warning" };
    if (percentage >= 40) return { grade: "D", color: "warning" };
    return { grade: "F", color: "danger" };
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="page-title">Marks Records</h1>
            <p className="page-subtitle">View all marks added by you</p>
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
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <FileText size={24} />
            </div>
            <div className="stat-value">{stats.totalRecords}</div>
            <div className="stat-label">Total Records</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon success">
              <TrendingUp size={24} />
            </div>
            <div className="stat-value">{stats.avgPercentage}%</div>
            <div className="stat-label">Avg. Score</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon warning">
              <User size={24} />
            </div>
            <div className="stat-value">{stats.uniqueStudents}</div>
            <div className="stat-label">Students</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
              <BookOpen size={24} />
            </div>
            <div className="stat-value">{stats.uniqueSubjects}</div>
            <div className="stat-label">Subjects</div>
          </div>
        </Col>
      </Row>

      {/* Search & Filter Bar */}
      <div className="card-modern mb-4">
        <div className="card-body-modern">
          <Row className="align-items-end g-3">
            <Col md={3}>
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
                  placeholder="Search by name, roll no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </Col>

            <Col md={3}>
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

            <Col md={3}>
              <label className="form-label-modern mb-2">
                <Award size={16} className="me-2" />
                Exam Type
              </label>
              <select
                className="form-control-modern"
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
              >
                <option value="">All Exams</option>
                {examTypes.map(exam => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </Col>

            <Col md={3}>
              <label className="form-label-modern mb-2">
                <Filter size={16} className="me-2" />
                Semester
              </label>
              <select
                className="form-control-modern"
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                <option value="">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Loading State */}
      {loading && marks.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-modern"></div>
        </div>
      ) : filteredMarks.length === 0 ? (
        <div className="card-modern text-center py-5">
          <BookOpen size={48} className="text-muted mb-3" />
          <h5>No Marks Records Found</h5>
          <p className="text-muted">
            {searchTerm || subjectFilter || examFilter || semesterFilter
              ? "Try adjusting your search or filters" 
              : "Start by adding marks for students"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-modern d-none d-md-block">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.map((record) => (
                  <MarksRow key={record.id} record={record} getGrade={getGrade} />
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none">
            <Row className="g-3">
              {filteredMarks.map((record) => (
                <Col xs={12} key={record.id}>
                  <MarksCard record={record} getGrade={getGrade} />
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
const MarksRow = React.memo(({ record, getGrade }) => {
  const percentage = Math.round((record.marksObtained / record.totalMarks) * 100);
  const gradeInfo = getGrade(percentage);
  
  return (
    <tr>
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
      <td>{record.subject}</td>
      <td>
        <span className="badge-modern badge-info">{record.examType}</span>
      </td>
      <td>
        <span className="fw-bold">{record.marksObtained}</span>
        <span className="text-muted"> / {record.totalMarks}</span>
        <small className="text-muted ms-1">({percentage}%)</small>
      </td>
      <td>
        <span className={`badge-modern badge-${gradeInfo.color}`}>
          {gradeInfo.grade}
        </span>
      </td>
      <td>
        <span className="badge-modern badge-secondary">Sem {record.semester}</span>
      </td>
    </tr>
  );
});

MarksRow.displayName = "MarksRow";

// ✅ Memoized Card Component (Mobile)
const MarksCard = React.memo(({ record, getGrade }) => {
  const percentage = Math.round((record.marksObtained / record.totalMarks) * 100);
  const gradeInfo = getGrade(percentage);
  
  return (
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
          <span className={`badge-modern badge-${gradeInfo.color}`}>
            {gradeInfo.grade}
          </span>
        </div>
        
        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="badge-modern badge-info">{record.subject}</span>
          <span className="badge-modern badge-secondary">{record.examType}</span>
          <span className="badge-modern badge-secondary">Sem {record.semester}</span>
        </div>
        
        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <div>
            <span className="text-muted small">Marks Obtained</span>
            <div className="fw-bold">
              {record.marksObtained} / {record.totalMarks}
            </div>
          </div>
          <div className="text-end">
            <span className="text-muted small">Percentage</span>
            <div className="fw-bold text-success">{percentage}%</div>
          </div>
        </div>
        
        {record.remarks && (
          <div className="mt-2 pt-2 border-top text-muted small">
            <strong>Remarks:</strong> {record.remarks}
          </div>
        )}
      </div>
    </div>
  );
});

MarksCard.displayName = "MarksCard";

export default ViewMarks;