import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { 
  BookOpen, 
  Search, 
  RefreshCw,
  Filter,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { getMyMarks, getMarksSummary } from "../../api/studentService";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import "../../styles/AdminStyles.css";

// Helper function to get grade
const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: "A+", color: "success" };
  if (percentage >= 80) return { grade: "A", color: "success" };
  if (percentage >= 70) return { grade: "B+", color: "primary" };
  if (percentage >= 60) return { grade: "B", color: "primary" };
  if (percentage >= 50) return { grade: "C", color: "warning" };
  if (percentage >= 40) return { grade: "D", color: "warning" };
  return { grade: "F", color: "danger" };
};

function StudentMarks() {
  const { user } = useAuth();
  
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  // Summary
  const [summary, setSummary] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch marks
  const fetchMarks = async (page = 0) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      const [marksData, summaryData] = await Promise.all([
        getMyMarks(user.id, page, pageSize),
        getMarksSummary(user.id).catch(() => null)
      ]);
      
      setMarks(marksData.content || []);
      setTotalPages(marksData.totalPages || 1);
      setTotalItems(marksData.totalItems || 0);
      setCurrentPage(page);
      setSummary(summaryData);
    } catch (err) {
      console.error("Error fetching marks:", err);
      setError(err.message || "Failed to load marks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMarks(0);
    }
  }, [user?.id]);

  // Get unique values for filters
  const semesters = useMemo(() => {
    const semSet = new Set(marks.map(m => m.semester));
    return Array.from(semSet).sort((a, b) => a - b);
  }, [marks]);

  const examTypes = useMemo(() => {
    const typeSet = new Set(marks.map(m => m.examType));
    return Array.from(typeSet).sort();
  }, [marks]);

  // Filter marks
  const filteredMarks = useMemo(() => {
    let result = [...marks];

    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(m =>
        m.subject?.toLowerCase().includes(search) ||
        m.examType?.toLowerCase().includes(search)
      );
    }

    if (semesterFilter) {
      result = result.filter(m => m.semester === parseInt(semesterFilter));
    }

    if (examTypeFilter) {
      result = result.filter(m => m.examType === examTypeFilter);
    }

    return result;
  }, [marks, debouncedSearch, semesterFilter, examTypeFilter]);

  const handlePageChange = (page) => {
    fetchMarks(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSemesterFilter("");
    setExamTypeFilter("");
    fetchMarks(0);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="page-title">My Marks</h1>
            <p className="page-subtitle">View your examination results and performance</p>
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
              <div className="stat-icon primary">
                <BookOpen size={24} />
              </div>
              <div className="stat-value">{summary.totalRecords || 0}</div>
              <div className="stat-label">Total Exams</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-icon success">
                <TrendingUp size={24} />
              </div>
              <div className="stat-value">{summary.overallPercentage?.toFixed(1) || 0}%</div>
              <div className="stat-label">Overall Percentage</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-icon warning">
                <Award size={24} />
              </div>
              <div className="stat-value">{Object.keys(summary.semesterWise || {}).length}</div>
              <div className="stat-label">Semesters</div>
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-value">
                {getGrade(summary.overallPercentage || 0).grade}
              </div>
              <div className="stat-label">Overall Grade</div>
            </div>
          </Col>
        </Row>
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
                  placeholder="Search by subject or exam type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </Col>
            <Col md={4}>
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
            <Col md={4}>
              <label className="form-label-modern mb-2">
                <Filter size={16} className="me-2" />
                Exam Type
              </label>
              <select
                className="form-control-modern"
                value={examTypeFilter}
                onChange={(e) => setExamTypeFilter(e.target.value)}
              >
                <option value="">All Exam Types</option>
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Marks Table */}
      {loading && marks.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-modern"></div>
        </div>
      ) : filteredMarks.length === 0 ? (
        <div className="card-modern text-center py-5">
          <BookOpen size={48} className="text-muted mb-3" />
          <h5>No Marks Found</h5>
          <p className="text-muted mb-0">
            {searchTerm || semesterFilter || examTypeFilter
              ? "Try adjusting your search or filters"
              : "Your marks will appear here once uploaded by teachers"}
          </p>
        </div>
      ) : (
        <>
          <div className="card-modern">
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam Type</th>
                    <th>Semester</th>
                    <th className="text-center">Marks</th>
                    <th className="text-center">Percentage</th>
                    <th className="text-center">Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarks.map((mark) => {
                    const percentage = (mark.marksObtained / mark.totalMarks) * 100;
                    const gradeInfo = getGrade(percentage);
                    
                    return (
                      <tr key={mark.id}>
                        <td>
                          <div className="fw-medium">{mark.subject}</div>
                        </td>
                        <td>
                          <span className="badge-modern badge-info">
                            {mark.examType}
                          </span>
                        </td>
                        <td>
                          <span className="badge-modern badge-secondary">
                            Sem {mark.semester}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="fw-bold">{mark.marksObtained}</span>
                          <span className="text-muted">/{mark.totalMarks}</span>
                        </td>
                        <td className="text-center">
                          <span className={`fw-medium text-${percentage >= 50 ? 'success' : 'danger'}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge bg-${gradeInfo.color}`}>
                            {gradeInfo.grade}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted small">
                            {mark.remarks || "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Semester-wise Summary */}
      {summary?.semesterWise && Object.keys(summary.semesterWise).length > 0 && (
        <div className="card-modern mt-4">
          <div className="card-header-modern">
            <h5 className="mb-0">Semester-wise Performance</h5>
          </div>
          <div className="card-body-modern">
            <Row className="g-3">
              {Object.entries(summary.semesterWise)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([semester, data]) => (
                  <Col xs={6} md={3} key={semester}>
                    <div 
                      className="p-3 rounded text-center"
                      style={{ background: "rgba(245, 158, 11, 0.1)" }}
                    >
                      <div className="small text-muted mb-1">Semester {semester}</div>
                      <div className="h4 fw-bold text-warning mb-1">
                        {data.percentage?.toFixed(1)}%
                      </div>
                      <div className="small">
                        <span className="badge bg-warning-subtle text-warning">
                          CGPA: {data.cgpa?.toFixed(2)}
                        </span>
                      </div>
                      <div className="small text-muted mt-1">
                        {data.totalSubjects} subjects
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

export default StudentMarks;