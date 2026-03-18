import React, { useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { 
  FileText, 
  Download, 
  ClipboardCheck,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  File
} from "lucide-react";
import { 
  downloadAcademicReport, 
  downloadAttendanceReport 
} from "../../api/studentService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AdminStyles.css";

function AcademicReports() {
  const { user } = useAuth();
  
  const [downloading, setDownloading] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleDownload = async (reportType) => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setDownloading(reportType);
    setError(null);
    setSuccess(null);

    try {
      if (reportType === 'academic') {
        await downloadAcademicReport(user.id);
        setSuccess("Academic report downloaded successfully!");
      } else if (reportType === 'attendance') {
        await downloadAttendanceReport(user.id);
        setSuccess("Attendance report downloaded successfully!");
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Download error:", err);
      setError(err.message || "Failed to download report");
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: 'academic',
      title: 'Academic Report',
      description: 'Complete academic performance report including all marks, grades, and CGPA calculation across all semesters.',
      icon: BookOpen,
      color: 'primary',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      features: [
        'Semester-wise marks summary',
        'Subject-wise performance',
        'CGPA calculation',
        'Grade distribution',
        'Overall academic standing'
      ]
    },
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Detailed attendance report showing your class attendance across all subjects with statistics.',
      icon: ClipboardCheck,
      color: 'success',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      features: [
        'Subject-wise attendance',
        'Overall attendance percentage',
        'Present/Absent breakdown',
        'Date-wise records',
        'Attendance status alerts'
      ]
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Reports</h1>
          <p className="page-subtitle">Download your academic and attendance reports</p>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Info Card */}
      <div className="alert alert-info d-flex align-items-start gap-3 mb-4">
        <FileText size={24} className="flex-shrink-0 mt-1" />
        <div>
          <h6 className="fw-bold mb-1">About Reports</h6>
          <p className="mb-0 small">
            Reports are generated in real-time based on your current academic data. 
            They include all marks and attendance records uploaded by your teachers. 
            Reports are available in PDF format and can be used for official purposes.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <Row className="g-4">
        {reports.map((report) => {
          const IconComponent = report.icon;
          const isDownloading = downloading === report.id;
          
          return (
            <Col md={6} key={report.id}>
              <div className="card-modern h-100">
                <div className="card-body-modern">
                  {/* Header */}
                  <div className="d-flex align-items-start gap-3 mb-4">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{ 
                        width: "60px", 
                        height: "60px",
                        background: report.gradient,
                        flexShrink: 0
                      }}
                    >
                      <IconComponent size={28} className="text-white" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">{report.title}</h5>
                      <p className="text-muted small mb-0">{report.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h6 className="fw-medium mb-3">What's Included:</h6>
                    <ul className="list-unstyled mb-0">
                      {report.features.map((feature, index) => (
                        <li key={index} className="d-flex align-items-center gap-2 mb-2">
                          <CheckCircle size={16} className={`text-${report.color}`} />
                          <span className="small">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* File Info */}
                  <div className="d-flex align-items-center gap-2 text-muted small mb-4">
                    <File size={16} />
                    <span>PDF Format • Generated in real-time</span>
                  </div>

                  {/* Download Button */}
                  <button 
                    className={`btn btn-${report.color} w-100 d-flex align-items-center justify-content-center gap-2 py-2`}
                    onClick={() => handleDownload(report.id)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Spinner size="sm" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Download {report.title}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      {/* Additional Info */}
      <div className="card-modern mt-4">
        <div className="card-body-modern">
          <Row className="align-items-center">
            <Col md={8}>
              <h5 className="fw-bold mb-2">
                <Award size={20} className="text-warning me-2" />
                Need Official Transcripts?
              </h5>
              <p className="text-muted mb-0">
                For official transcripts or verified academic documents, please contact the 
                administrative office. These downloadable reports are for personal reference only.
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <span className="badge bg-warning-subtle text-warning px-3 py-2">
                <FileText size={16} className="me-2" />
                For Personal Use
              </span>
            </Col>
          </Row>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="card-modern mt-4">
        <div className="card-header-modern">
          <h6 className="mb-0">Report Details</h6>
        </div>
        <div className="card-body-modern">
          <Row className="g-3">
            <Col xs={6} md={3}>
              <div className="text-muted small">Student Name</div>
              <div className="fw-medium">{user?.name || "N/A"}</div>
            </Col>
            <Col xs={6} md={3}>
              <div className="text-muted small">Roll Number</div>
              <div className="fw-medium">{user?.rollNo || "N/A"}</div>
            </Col>
            <Col xs={6} md={3}>
              <div className="text-muted small">Department</div>
              <div className="fw-medium">{user?.department || "N/A"}</div>
            </Col>
            <Col xs={6} md={3}>
              <div className="text-muted small">Course</div>
              <div className="fw-medium">{user?.course || "N/A"}</div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default AcademicReports;