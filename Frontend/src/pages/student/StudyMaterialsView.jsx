import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { 
  FileText, 
  Download, 
  Search, 
  RefreshCw,
  Filter,
  File,
  FileSpreadsheet,
  Image,
  Archive,
  BookOpen,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";
import { 
  getAllStudyMaterials, 
  searchStudyMaterials,
  downloadStudyMaterial
} from "../../api/studentService";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import "../../styles/AdminStyles.css";

// File type icons mapping
const getFileIcon = (fileType) => {
  const type = fileType?.toLowerCase();
  if (["pdf"].includes(type)) return <FileText className="text-danger" />;
  if (["doc", "docx"].includes(type)) return <FileText className="text-primary" />;
  if (["xls", "xlsx"].includes(type)) return <FileSpreadsheet className="text-success" />;
  if (["ppt", "pptx"].includes(type)) return <FileText className="text-warning" />;
  if (["jpg", "jpeg", "png", "gif"].includes(type)) return <Image className="text-info" />;
  if (["zip", "rar"].includes(type)) return <Archive className="text-secondary" />;
  return <File className="text-muted" />;
};

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

function StudyMaterialsView() {
  // State
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  // Download state
  const [downloading, setDownloading] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch materials
  const fetchMaterials = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (debouncedSearch) {
        // Search materials
        const searchResults = await searchStudyMaterials(debouncedSearch);
        response = {
          content: searchResults,
          totalPages: 1,
          totalItems: searchResults.length
        };
      } else {
        // Get all materials
        response = await getAllStudyMaterials(page, pageSize);
      }
      
      if (Array.isArray(response)) {
        setMaterials(response);
        setTotalPages(1);
        setTotalItems(response.length);
      } else if (response && response.content) {
        setMaterials(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || response.totalElements || 0);
      } else {
        setMaterials([]);
      }
      
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError(err.message || "Failed to load study materials");
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    fetchMaterials(0);
  }, [debouncedSearch]);

  // Get unique values for filters
  const subjects = useMemo(() => {
    const subjectSet = new Set(materials.map(m => m.subject));
    return Array.from(subjectSet).sort();
  }, [materials]);

  const categories = useMemo(() => {
    const categorySet = new Set(materials.map(m => m.category).filter(Boolean));
    return Array.from(categorySet).sort();
  }, [materials]);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    let result = Array.isArray(materials) ? materials : [];

    if (subjectFilter) {
      result = result.filter(m => m.subject === subjectFilter);
    }

    if (categoryFilter) {
      result = result.filter(m => m.category === categoryFilter);
    }

    return result;
  }, [materials, subjectFilter, categoryFilter]);

  // Handle download
  const handleDownload = async (material) => {
    setDownloading(material.id);
    
    try {
      await downloadStudyMaterial(material.id, material.fileName);
      console.log("✅ Download completed:", material.fileName);
    } catch (err) {
      console.error("❌ Download error:", err);
      alert("Failed to download: " + err.message);
    } finally {
      setDownloading(null);
    }
  };

  const handlePageChange = (page) => {
    fetchMaterials(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSubjectFilter("");
    setCategoryFilter("");
    fetchMaterials(0);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="page-title">Study Materials</h1>
            <p className="page-subtitle">Access study materials uploaded by teachers</p>
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

      {/* Stats Summary */}
      <Row className="g-4 mb-4">
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <FileText size={24} />
            </div>
            <div className="stat-value">{totalItems}</div>
            <div className="stat-label">Total Materials</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon success">
              <BookOpen size={24} />
            </div>
            <div className="stat-value">{subjects.length}</div>
            <div className="stat-label">Subjects</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon warning">
              <Filter size={24} />
            </div>
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
              <Download size={24} />
            </div>
            <div className="stat-value">
              {materials.reduce((sum, m) => sum + (m.downloadCount || 0), 0)}
            </div>
            <div className="stat-label">Total Downloads</div>
          </div>
        </Col>
      </Row>

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
                  placeholder="Search by title, description, subject..."
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
                Category
              </label>
              <select
                className="form-control-modern"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </Col>
          </Row>
        </div>
      </div>

      {/* Materials Grid */}
      {loading && materials.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-modern"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="card-modern text-center py-5">
          <FileText size={48} className="text-muted mb-3" />
          <h5>No Study Materials Found</h5>
          <p className="text-muted mb-0">
            {searchTerm || subjectFilter || categoryFilter
              ? "Try adjusting your search or filters" 
              : "Study materials uploaded by teachers will appear here"}
          </p>
        </div>
      ) : (
        <>
          <Row className="g-4">
            {filteredMaterials.map((material) => (
              <Col xs={12} sm={6} lg={4} xl={3} key={material.id}>
                <MaterialCard 
                  material={material}
                  onDownload={() => handleDownload(material)}
                  downloading={downloading === material.id}
                />
              </Col>
            ))}
          </Row>

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

// Material Card Component
const MaterialCard = React.memo(({ material, onDownload, downloading }) => (
  <div className="card-modern h-100">
    <div className="card-body-modern">
      {/* File Icon & Category */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="d-flex align-items-center gap-2">
          {getFileIcon(material.fileType)}
          <span className="badge-modern badge-info small">
            {material.category || "Other"}
          </span>
        </div>
        <span className="text-muted small">{material.fileType?.toUpperCase()}</span>
      </div>

      {/* Title & Description */}
      <h6 className="fw-bold mb-2 text-truncate" title={material.title}>
        {material.title}
      </h6>
      {material.description && (
        <p className="text-muted small mb-2" style={{ 
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {material.description}
        </p>
      )}

      {/* Subject & Semester */}
      <div className="d-flex flex-wrap gap-1 mb-3">
        <span className="badge-modern badge-success small">{material.subject}</span>
        {material.semester && (
          <span className="badge-modern badge-secondary small">Sem {material.semester}</span>
        )}
      </div>

      {/* Teacher Info */}
      {material.teacher && (
        <div className="d-flex align-items-center gap-2 text-muted small mb-2">
          <User size={14} />
          <span>{material.teacher.name || "Teacher"}</span>
        </div>
      )}

      {/* File Info */}
      <div className="d-flex justify-content-between text-muted small mb-2">
        <span>{formatFileSize(material.fileSize)}</span>
        <span>{material.downloadCount || 0} downloads</span>
      </div>

      {/* Date */}
      <div className="d-flex align-items-center gap-2 text-muted small mb-3">
        <Calendar size={14} />
        <span>{formatDate(material.createdAt)}</span>
      </div>

      {/* Download Button */}
      <button 
        className="btn btn-warning w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={onDownload}
        disabled={downloading}
      >
        {downloading ? (
          <>
            <Spinner size="sm" />
            Downloading...
          </>
        ) : (
          <>
            <Download size={16} />
            Download
          </>
        )}
      </button>
    </div>
  </div>
));

MaterialCard.displayName = "MaterialCard";

export default StudyMaterialsView;