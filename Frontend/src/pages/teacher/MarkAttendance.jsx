// pages/teacher/MarkAttendance.jsx
import React, { useState } from "react";
import { Row, Col, ProgressBar } from "react-bootstrap";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Download,
  AlertCircle,
  Info
} from "lucide-react";
import { importAttendanceCSV } from "../../api/teacherService";
import { useAuth } from "../../context/AuthContext";
import { downloadCSVTemplate } from "../../utils/helpers";

function MarkAttendance() {
  const { user } = useAuth();
  
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError(null);
    setImportResult(null);
    
    if (!file) {
      setCsvFile(null);
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file (.csv extension)");
      e.target.value = "";
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    setCsvFile(file);
  };

  const handleCSVImport = async () => {
    if (!csvFile) {
      setError("Please select a CSV file");
      return;
    }

    if (!user?.id) {
      setError("User session expired. Please login again.");
      return;
    }

    setImporting(true);
    setError(null);
    setImportResult(null);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const result = await importAttendanceCSV(csvFile, user.id);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setImportResult(result);
      
      // Clear file input on success
      if (result.successCount > 0) {
        setCsvFile(null);
        const fileInput = document.getElementById("csv-upload");
        if (fileInput) fileInput.value = "";
      }
      
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Import error:", err);
      setError(err.message || "Failed to import CSV. Please try again.");
    } finally {
      setTimeout(() => {
        setImporting(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDownloadTemplate = () => {
    const template = `rollNo,date,subject,status,remarks
STU001,2024-01-15,Data Structures,P,
STU002,2024-01-15,Data Structures,A,Sick leave
STU003,2024-01-15,Data Structures,P,
STU004,2024-01-15,Algorithms,P,Good participation
STU005,2024-01-15,Algorithms,A,`;

    downloadCSVTemplate("attendance_template.csv", template);
  };

  const resetForm = () => {
    setCsvFile(null);
    setImportResult(null);
    setError(null);
    const fileInput = document.getElementById("csv-upload");
    if (fileInput) fileInput.value = "";
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">📊 Import Attendance</h1>
        <p className="text-muted mb-0">Upload CSV file to import attendance records</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <XCircle size={20} />
          <span>{error}</span>
          <button 
            type="button" 
            className="btn-close ms-auto" 
            onClick={() => setError(null)}
          />
        </div>
      )}

      {/* Instructions Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">📋 CSV Format Instructions</h5>
          <button 
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" 
            onClick={handleDownloadTemplate}
          >
            <Download size={16} />
            Download Template
          </button>
        </div>
        <div className="card-body">
          <div className="alert alert-info mb-3 d-flex align-items-center gap-2">
            <Info size={18} />
            <strong>CSV Format:</strong> 
            <code className="ms-2">rollNo, date, subject, status, remarks</code>
          </div>
          
          <Row className="g-3">
            <Col md={6}>
              <h6 className="fw-bold mb-2">Required Columns:</h6>
              <ul className="mb-0 small">
                <li><code>rollNo</code> - Student Roll Number (e.g., STU001)</li>
                <li><code>date</code> - Date in <strong>YYYY-MM-DD</strong> format</li>
                <li><code>subject</code> - Subject name (e.g., Data Structures)</li>
                <li><code>status</code> - <strong>P</strong> for Present, <strong>A</strong> for Absent</li>
                <li><code>remarks</code> - Optional notes</li>
              </ul>
            </Col>
            <Col md={6}>
              <h6 className="fw-bold mb-2">Example CSV:</h6>
              <pre 
                className="bg-light p-3 rounded small mb-0" 
                style={{ fontSize: "0.8rem", overflowX: "auto" }}
              >
{`rollNo,date,subject,status,remarks
STU001,2024-01-15,Math,P,
STU002,2024-01-15,Math,A,Sick leave
STU003,2024-01-15,Math,P,`}
              </pre>
            </Col>
          </Row>

          <div className="alert alert-warning mt-3 mb-0 d-flex align-items-center gap-2">
            <AlertCircle size={18} />
            <span>
              <strong>Important:</strong> File size limit is 5MB. Date cannot be in the future. 
              Duplicate entries (same student, date, subject) will be skipped.
            </span>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent">
          <h5 className="mb-0 fw-bold">📁 Upload CSV File</h5>
        </div>
        <div className="card-body">
          <div 
            className="border-2 border-dashed rounded p-5 text-center"
            style={{ 
              borderColor: csvFile ? "#10b981" : "#dee2e6",
              background: csvFile ? "rgba(16, 185, 129, 0.05)" : "transparent"
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              id="csv-upload"
              className="d-none"
              disabled={importing}
            />
            <label 
              htmlFor="csv-upload" 
              className="d-block mb-0"
              style={{ cursor: importing ? "not-allowed" : "pointer" }}
            >
              <FileSpreadsheet 
                size={48} 
                className={csvFile ? "text-success mb-3" : "text-muted mb-3"} 
              />
              <p className="mb-1 fw-medium">
                {csvFile ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <CheckCircle size={18} className="text-success" />
                    {csvFile.name}
                  </span>
                ) : (
                  "Click to select CSV file or drag and drop"
                )}
              </p>
              {csvFile && (
                <small className="text-muted">
                  Size: {(csvFile.size / 1024).toFixed(2)} KB
                </small>
              )}
              {!csvFile && (
                <small className="text-muted">Maximum file size: 5MB</small>
              )}
            </label>
          </div>

          {/* Progress Bar */}
          {importing && (
            <div className="mt-4">
              <ProgressBar 
                now={uploadProgress} 
                label={`${uploadProgress}%`}
                animated 
                striped 
                variant="success"
                style={{ height: "24px" }}
              />
              <p className="text-center text-muted small mt-2 mb-0">
                Processing CSV file... Please wait
              </p>
            </div>
          )}

          {/* Import Button */}
          {csvFile && !importing && (
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                onClick={handleCSVImport}
              >
                <Upload size={20} />
                Import Attendance
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-transparent">
            <h5 className="mb-0 fw-bold">📊 Import Results</h5>
          </div>
          <div className="card-body">
            <Row className="g-3 mb-4">
              <Col xs={4}>
                <div 
                  className="text-center p-3 rounded" 
                  style={{ background: "rgba(59, 130, 246, 0.1)" }}
                >
                  <div className="h4 fw-bold text-primary mb-1">
                    {importResult.totalRecords}
                  </div>
                  <small className="text-muted">Total Records</small>
                </div>
              </Col>
              <Col xs={4}>
                <div 
                  className="text-center p-3 rounded" 
                  style={{ background: "rgba(16, 185, 129, 0.1)" }}
                >
                  <div className="h4 fw-bold text-success mb-1">
                    {importResult.successCount}
                  </div>
                  <small className="text-muted">✅ Imported</small>
                </div>
              </Col>
              <Col xs={4}>
                <div 
                  className="text-center p-3 rounded" 
                  style={{ background: "rgba(239, 68, 68, 0.1)" }}
                >
                  <div className="h4 fw-bold text-danger mb-1">
                    {importResult.failedCount}
                  </div>
                  <small className="text-muted">❌ Failed</small>
                </div>
              </Col>
            </Row>

            {/* Skipped Records */}
            {importResult.skippedCount > 0 && (
              <div className="alert alert-warning mb-3 d-flex align-items-center gap-2">
                <AlertCircle size={18} />
                {importResult.skippedCount} record(s) skipped (duplicates)
              </div>
            )}

            {/* Success Message */}
            {importResult.successCount > 0 && (
              <div className="alert alert-success d-flex align-items-center gap-2">
                <CheckCircle size={18} />
                Successfully imported {importResult.successCount} attendance records!
              </div>
            )}

            {/* Errors */}
            {importResult.errors?.length > 0 && (
              <div>
                <h6 className="fw-bold mb-3 text-danger d-flex align-items-center gap-2">
                  <XCircle size={16} />
                  Errors ({importResult.errors.length}):
                </h6>
                <div 
                  className="p-3 rounded" 
                  style={{ 
                    background: "rgba(239, 68, 68, 0.05)", 
                    maxHeight: "200px", 
                    overflowY: "auto" 
                  }}
                >
                  <ul className="list-unstyled mb-0 small">
                    {importResult.errors.slice(0, 20).map((err, idx) => (
                      <li key={idx} className="text-danger mb-1 d-flex align-items-start gap-2">
                        <XCircle size={14} className="flex-shrink-0 mt-1" />
                        {err}
                      </li>
                    ))}
                    {importResult.errors.length > 20 && (
                      <li className="text-muted">
                        ... and {importResult.errors.length - 20} more errors
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <button 
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                Import Another File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkAttendance;