// pages/teacher/StudyMaterials.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Row, Col, Form, Modal, Spinner, ProgressBar } from "react-bootstrap";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Edit2, 
  Search, 
  RefreshCw,
  Filter,
  File,
  FileSpreadsheet,
  Image,
  Archive,
  CheckCircle,
  XCircle,
  Plus,
  BookOpen,
  HardDrive
} from "lucide-react";
import { 
  getMaterialsByTeacher, 
  uploadStudyMaterial, 
  deleteMaterial,
  updateMaterial,
  getMaterialStats,
  getMaterialSubjects,
  downloadMaterial  // ✅ ADD THIS IMPORT
} from "../../api/teacherService";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import Pagination from "../../components/Pagination";
import ConfirmModal from "../../components/ConfirmModal";
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

function StudyMaterials() {
  const { user } = useAuth();
  
  // State
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [subjects, setSubjects] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  // Stats
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalDownloads: 0,
    totalSizeFormatted: "0 B"
  });

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "",
    category: "Notes",
    file: null
  });
  const [uploadError, setUploadError] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ Download state
  const [downloading, setDownloading] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch materials
  const fetchMaterials = useCallback(async (page = 0) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await getMaterialsByTeacher(user.id, page, pageSize);
      
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
      setError(err.message || "Failed to load materials");
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, pageSize]);

  // Fetch stats and subjects
  const fetchStatsAndSubjects = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const [statsData, subjectsData] = await Promise.all([
        getMaterialStats(user.id),
        getMaterialSubjects(user.id)
      ]);
      
      setStats(statsData);
      setSubjects(subjectsData || []);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchMaterials(0);
      fetchStatsAndSubjects();
    }
  }, [user?.id, fetchMaterials, fetchStatsAndSubjects]);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    let result = Array.isArray(materials) ? materials : [];

    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(m =>
        m.title?.toLowerCase().includes(search) ||
        m.description?.toLowerCase().includes(search) ||
        m.subject?.toLowerCase().includes(search)
      );
    }

    if (subjectFilter) {
      result = result.filter(m => m.subject === subjectFilter);
    }

    return result;
  }, [materials, debouncedSearch, subjectFilter]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadError("File size must be less than 50MB");
        return;
      }
      setUploadForm(prev => ({ ...prev, file }));
      setUploadError(null);
    }
  };

  // Upload material
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      setUploadError("Please select a file");
      return;
    }
    if (!uploadForm.title.trim()) {
      setUploadError("Title is required");
      return;
    }
    if (!uploadForm.subject.trim()) {
      setUploadError("Subject is required");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("teacherId", user.id);
      formData.append("title", uploadForm.title.trim());
      formData.append("description", uploadForm.description.trim());
      formData.append("subject", uploadForm.subject.trim());
      if (uploadForm.semester) {
        formData.append("semester", uploadForm.semester);
      }
      formData.append("category", uploadForm.category);

      await uploadStudyMaterial(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setShowUploadModal(false);
      setUploadForm({
        title: "",
        description: "",
        subject: "",
        semester: "",
        category: "Notes",
        file: null
      });
      
      fetchMaterials(0);
      fetchStatsAndSubjects();
      
    } catch (err) {
      clearInterval(progressInterval);
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Edit material
  const handleEdit = (material) => {
    setEditingMaterial({
      id: material.id,
      title: material.title,
      description: material.description || "",
      subject: material.subject,
      semester: material.semester || "",
      category: material.category || "Notes"
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMaterial) return;
    
    setSavingEdit(true);
    
    try {
      await updateMaterial(editingMaterial.id, editingMaterial);
      setShowEditModal(false);
      setEditingMaterial(null);
      fetchMaterials(currentPage);
    } catch (err) {
      alert(err.message || "Failed to update material");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete material
  const handleDelete = (material) => {
    setDeletingMaterial(material);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingMaterial) return;
    
    setDeleting(true);
    
    try {
      await deleteMaterial(deletingMaterial.id, user.id);
      setShowDeleteModal(false);
      setDeletingMaterial(null);
      fetchMaterials(0);
      fetchStatsAndSubjects();
    } catch (err) {
      alert(err.message || "Failed to delete material");
    } finally {
      setDeleting(false);
    }
  };

  // ✅ FIXED DOWNLOAD FUNCTION - Uses fetch API instead of window.open
  const handleDownload = async (material) => {
    setDownloading(material.id);
    
    try {
      await downloadMaterial(material.id, material.fileName);
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
    fetchMaterials(0);
    fetchStatsAndSubjects();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="page-title">Study Materials</h1>
            <p className="page-subtitle">Upload and manage study materials for students</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-modern btn-secondary-modern" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              Refresh
            </button>
            <button 
              className="btn btn-modern btn-primary-modern"
              onClick={() => setShowUploadModal(true)}
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              <Plus size={18} />
              Upload Material
            </button>
          </div>
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
              <FileText size={24} />
            </div>
            <div className="stat-value">{stats.totalMaterials}</div>
            <div className="stat-label">Total Files</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon success">
              <Download size={24} />
            </div>
            <div className="stat-value">{stats.totalDownloads}</div>
            <div className="stat-label">Downloads</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon warning">
              <BookOpen size={24} />
            </div>
            <div className="stat-value">{subjects.length}</div>
            <div className="stat-label">Subjects</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
              <HardDrive size={24} />
            </div>
            <div className="stat-value">{stats.totalSizeFormatted}</div>
            <div className="stat-label">Storage Used</div>
          </div>
        </Col>
      </Row>

      {/* Search & Filter */}
      <div className="card-modern mb-4">
        <div className="card-body-modern">
          <Row className="align-items-end g-3">
            <Col md={6}>
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
            <Col md={6}>
              <label className="form-label-modern mb-2">
                <Filter size={16} className="me-2" />
                Filter by Subject
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

      {/* Materials Grid */}
      {loading && materials.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-modern"></div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="card-modern text-center py-5">
          <FileText size={48} className="text-muted mb-3" />
          <h5>No Study Materials Found</h5>
          <p className="text-muted mb-3">
            {searchTerm || subjectFilter
              ? "Try adjusting your search or filter" 
              : "Upload your first study material to get started"}
          </p>
          <button 
            className="btn btn-modern btn-primary-modern"
            onClick={() => setShowUploadModal(true)}
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <Plus size={18} />
            Upload Material
          </button>
        </div>
      ) : (
        <>
          <Row className="g-4">
            {filteredMaterials.map((material) => (
              <Col xs={12} sm={6} lg={4} xl={3} key={material.id}>
                <MaterialCard 
                  material={material}
                  onEdit={() => handleEdit(material)}
                  onDelete={() => handleDelete(material)}
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

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => !uploading && setShowUploadModal(false)} centered size="lg">
        <Modal.Header closeButton={!uploading}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Upload size={24} className="text-success" />
            Upload Study Material
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {uploadError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
              <XCircle size={18} />
              {uploadError}
            </div>
          )}

          <Form onSubmit={handleUpload}>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium">File *</Form.Label>
                  <div 
                    className="border-2 border-dashed rounded p-4 text-center"
                    style={{ 
                      borderColor: uploadForm.file ? "#10b981" : "#dee2e6",
                      background: uploadForm.file ? "rgba(16, 185, 129, 0.05)" : "transparent",
                      cursor: "pointer"
                    }}
                    onClick={() => document.getElementById("file-input").click()}
                  >
                    <input
                      type="file"
                      id="file-input"
                      className="d-none"
                      onChange={handleFileSelect}
                      disabled={uploading}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                    />
                    {uploadForm.file ? (
                      <div>
                        <CheckCircle size={32} className="text-success mb-2" />
                        <p className="mb-0 fw-medium">{uploadForm.file.name}</p>
                        <small className="text-muted">{formatFileSize(uploadForm.file.size)}</small>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} className="text-muted mb-2" />
                        <p className="mb-0">Click to select file</p>
                        <small className="text-muted">Max 50MB - PDF, DOC, PPT, XLS, Images, ZIP</small>
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Title *</Form.Label>
                  <Form.Control
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Data Structures Notes - Unit 1"
                    disabled={uploading}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Subject *</Form.Label>
                  <Form.Control
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Data Structures"
                    disabled={uploading}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Category</Form.Label>
                  <Form.Select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    disabled={uploading}
                  >
                    <option value="Notes">Notes</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Question Paper">Question Paper</option>
                    <option value="Reference">Reference</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Semester</Form.Label>
                  <Form.Select
                    value={uploadForm.semester}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, semester: e.target.value }))}
                    disabled={uploading}
                  >
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-medium">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the material..."
                    disabled={uploading}
                  />
                </Form.Group>
              </Col>
            </Row>

            {uploading && (
              <div className="mt-3">
                <ProgressBar 
                  now={uploadProgress} 
                  label={`${uploadProgress}%`}
                  animated 
                  striped 
                  variant="success"
                />
                <p className="text-center text-muted small mt-2">Uploading... Please wait</p>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowUploadModal(false)}
            disabled={uploading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={handleUpload}
            disabled={uploading || !uploadForm.file}
          >
            {uploading ? (
              <>
                <Spinner size="sm" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => !savingEdit && setShowEditModal(false)} centered>
        <Modal.Header closeButton={!savingEdit}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Edit2 size={24} className="text-primary" />
            Edit Material
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingMaterial && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Title</Form.Label>
                <Form.Control
                  value={editingMaterial.title}
                  onChange={(e) => setEditingMaterial(prev => ({ ...prev, title: e.target.value }))}
                  disabled={savingEdit}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Subject</Form.Label>
                <Form.Control
                  value={editingMaterial.subject}
                  onChange={(e) => setEditingMaterial(prev => ({ ...prev, subject: e.target.value }))}
                  disabled={savingEdit}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Category</Form.Label>
                <Form.Select
                  value={editingMaterial.category}
                  onChange={(e) => setEditingMaterial(prev => ({ ...prev, category: e.target.value }))}
                  disabled={savingEdit}
                >
                  <option value="Notes">Notes</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Question Paper">Question Paper</option>
                  <option value="Reference">Reference</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editingMaterial.description}
                  onChange={(e) => setEditingMaterial(prev => ({ ...prev, description: e.target.value }))}
                  disabled={savingEdit}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowEditModal(false)}
            disabled={savingEdit}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleSaveEdit}
            disabled={savingEdit}
          >
            {savingEdit ? <Spinner size="sm" /> : <CheckCircle size={18} />}
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Material"
        message={`Are you sure you want to delete "${deletingMaterial?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

// ✅ UPDATED Material Card Component with downloading state
const MaterialCard = React.memo(({ material, onEdit, onDelete, onDownload, downloading }) => (
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

      {/* File Info */}
      <div className="d-flex justify-content-between text-muted small mb-3">
        <span>{formatFileSize(material.fileSize)}</span>
        <span>{material.downloadCount || 0} downloads</span>
      </div>

      {/* Date */}
      <div className="text-muted small mb-3">
        Uploaded: {formatDate(material.createdAt)}
      </div>

      {/* Actions */}
      <div className="d-flex gap-2">
        <button 
          className="btn btn-sm btn-outline-success flex-grow-1 d-flex align-items-center justify-content-center gap-1"
          onClick={onDownload}
          disabled={downloading}
          title="Download"
        >
          {downloading ? (
            <>
              <Spinner size="sm" />
              Downloading...
            </>
          ) : (
            <>
              <Download size={14} />
              Download
            </>
          )}
        </button>
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={onEdit}
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button 
          className="btn btn-sm btn-outline-danger"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </div>
));

MaterialCard.displayName = "MaterialCard";

export default StudyMaterials;