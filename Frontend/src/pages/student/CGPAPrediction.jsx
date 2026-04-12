import React, { useState, useEffect } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { 
  TrendingUp, 
  Award, 
  Target,
  AlertCircle,
  RefreshCw,
  Brain,
  BarChart2,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  Info
} from "lucide-react";
import { 
  getCurrentCGPA, 
  predictCGPA, 
  getPerformanceAnalytics,
  getPerformanceTrends 
} from "../../api/studentService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AdminStyles.css";

function CGPAPrediction() {
  const { user } = useAuth();
  
  const [currentCGPA, setCurrentCGPA] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [cgpaData, analyticsData, trendsData] = await Promise.all([
        getCurrentCGPA(user.id).catch(() => null),
        getPerformanceAnalytics(user.id).catch(() => null),
        getPerformanceTrends(user.id).catch(() => null)
      ]);
      
      setCurrentCGPA(cgpaData);
      setAnalytics(analyticsData);
      setTrends(trendsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    setError(null);
    
    try {
      const result = await predictCGPA(user.id);
      setPrediction(result);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.message || "Failed to predict CGPA");
    } finally {
      setPredicting(false);
    }
  };

  const getStatusColor = (value, type = "cgpa") => {
    if (type === "cgpa") {
      if (value >= 8) return "success";
      if (value >= 6) return "primary";
      if (value >= 5) return "warning";
      return "danger";
    }
    if (value >= 75) return "success";
    if (value >= 60) return "warning";
    return "danger";
  };

  const getTrendIcon = (trend) => {
    if (trend === "improving") return <ArrowUp className="text-success" />;
    if (trend === "declining") return <ArrowDown className="text-danger" />;
    return <Minus className="text-muted" />;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-modern"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="page-title">CGPA & Performance Analytics</h1>
            <p className="page-subtitle">
              Track your academic performance and get AI-powered predictions
            </p>
          </div>
          <button 
            className="btn btn-modern btn-secondary-modern" 
            onClick={fetchData}
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

      {/* Current Stats */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className={`stat-icon ${getStatusColor(currentCGPA?.currentCGPA || 0)}`}>
              <Award size={24} />
            </div>
            <div className="stat-value">
              {currentCGPA?.currentCGPA?.toFixed(2) || "0.00"}
            </div>
            <div className="stat-label">Current CGPA</div>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className={`stat-icon ${getStatusColor(analytics?.averagePercentage || 0, "percentage")}`}>
              <BarChart2 size={24} />
            </div>
            <div className="stat-value">
              {analytics?.averagePercentage?.toFixed(1) || 0}%
            </div>
            <div className="stat-label">Average Percentage</div>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className={`stat-icon ${getStatusColor(analytics?.attendanceRate || 0, "percentage")}`}>
              <Target size={24} />
            </div>
            <div className="stat-value">
              {analytics?.attendanceRate?.toFixed(1) || 0}%
            </div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <TrendingUp size={24} />
            </div>
            <div className="stat-value">
              {currentCGPA?.completedSemesters || 0}
            </div>
            <div className="stat-label">Semesters Completed</div>
          </div>
        </Col>
      </Row>

      {/* CGPA Prediction Section */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <div className="card-modern h-100">
            <div className="card-header-modern">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <Brain size={20} className="text-primary" />
                AI-Powered CGPA Prediction
              </h5>
            </div>
            <div className="card-body-modern text-center">
              {!prediction ? (
                /* ── Before Prediction ── */
                <div className="py-4">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                    style={{ 
                      width: "100px", 
                      height: "100px",
                      background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))"
                    }}
                  >
                    <Brain size={48} style={{ color: "#8b5cf6" }} />
                  </div>
                  <h5 className="fw-bold mb-2">
                    Predict Your Next Semester CGPA
                  </h5>
                  <p className="text-muted mb-4">
                    Our ML model analyzes your past semester data to predict 
                    your next semester's CGPA
                  </p>
                  <button 
                    className="btn btn-lg px-5 py-2"
                    onClick={handlePredict}
                    disabled={predicting}
                    style={{ 
                      background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                      color: "white",
                      border: "none"
                    }}
                  >
                    {predicting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp size={20} className="me-2" />
                        Predict My CGPA
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* ── After Prediction ── */
                <div className="py-3">
                  {prediction.success ? (
                    <>
                      {/* ✅ NEW: Predicted Semester Label */}
                      <div className="mb-2">
                        <span className="badge bg-info px-3 py-2">
                          Predicting Semester {prediction.predictingForSemester || "Next"}
                        </span>
                      </div>

                      {/* Predicted CGPA Circle */}
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                        style={{ 
                          width: "120px", 
                          height: "120px",
                          background: `linear-gradient(135deg, rgba(${
                            prediction.predictedCGPA >= 8 ? '16, 185, 129' : 
                            prediction.predictedCGPA >= 6 ? '59, 130, 246' : 
                            prediction.predictedCGPA >= 5 ? '245, 158, 11' : '239, 68, 68'
                          }, 0.1), rgba(${
                            prediction.predictedCGPA >= 8 ? '16, 185, 129' : 
                            prediction.predictedCGPA >= 6 ? '59, 130, 246' : 
                            prediction.predictedCGPA >= 5 ? '245, 158, 11' : '239, 68, 68'
                          }, 0.2))`
                        }}
                      >
                        <div className="text-center">
                          <div className={`h2 fw-bold mb-0 text-${getStatusColor(prediction.predictedCGPA)}`}>
                            {prediction.predictedCGPA?.toFixed(2)}
                          </div>
                          <small className="text-muted">CGPA</small>
                        </div>
                      </div>
                      
                      <h5 className="fw-bold mb-2">
                        Predicted Semester {prediction.predictingForSemester || "Next"} CGPA
                      </h5>

                      {/* ✅ NEW: Prediction Range */}
                      {prediction.range && (
                        <div className="mb-3">
                          <small className="text-muted">Expected Range: </small>
                          <span className="fw-bold text-primary">
                            {prediction.range.low?.toFixed(2)} — {prediction.range.high?.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {/* Stats Row */}
                      <div className="d-flex justify-content-center gap-4 mb-3">
                        <div className="text-center">
                          <div className="small text-muted">Confidence</div>
                          <div className="fw-bold text-primary">
                            {prediction.confidence}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="small text-muted">Data Points</div>
                          <div className="fw-bold">{prediction.dataPoints}</div>
                        </div>
                        <div className="text-center">
                          <div className="small text-muted">Model</div>
                          <div className="fw-bold text-success">
                            {prediction.modelUsed === 'ml_model' ? 'AI' : 'Statistical'}
                          </div>
                        </div>
                      </div>

                      {/* ✅ NEW: Past Semester CGPAs */}
                      {prediction.pastSemesterCGPAs && 
                       prediction.pastSemesterCGPAs.length > 0 && (
                        <div className="text-start mb-3 p-3 rounded" 
                             style={{ background: "rgba(59, 130, 246, 0.05)" }}>
                          <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                            <BarChart2 size={16} />
                            Past Semester CGPAs
                          </h6>
                          <div className="d-flex gap-2 flex-wrap">
                            {prediction.pastSemesterCGPAs.map((cgpa, idx) => (
                              <div 
                                key={idx}
                                className="text-center p-2 rounded"
                                style={{ 
                                  background: "white", 
                                  minWidth: "70px",
                                  border: "1px solid #e5e7eb"
                                }}
                              >
                                <small className="text-muted d-block">
                                  Sem {idx + 1}
                                </small>
                                <span className={`fw-bold text-${getStatusColor(cgpa)}`}>
                                  {cgpa.toFixed(2)}
                                </span>
                              </div>
                            ))}
                            
                            {/* ✅ NEW: Predicted semester highlighted */}
                            <div 
                              className="text-center p-2 rounded"
                              style={{ 
                                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))",
                                minWidth: "70px",
                                border: "2px solid #8b5cf6"
                              }}
                            >
                              <small className="text-muted d-block">
                                Sem {prediction.predictingForSemester}
                              </small>
                              <span className={`fw-bold text-${getStatusColor(prediction.predictedCGPA)}`}>
                                {prediction.predictedCGPA?.toFixed(2)}
                              </span>
                              <small className="d-block" style={{ color: "#8b5cf6", fontSize: "10px" }}>
                                predicted
                              </small>
                            </div>
                          </div>

                          {/* ✅ NEW: Visual Trend Arrow */}
                          {prediction.pastSemesterCGPAs.length >= 2 && (
                            <div className="mt-2 d-flex align-items-center gap-2">
                              <small className="text-muted">Trend:</small>
                              {(() => {
                                const cgpas = prediction.pastSemesterCGPAs;
                                const last = cgpas[cgpas.length - 1];
                                const secondLast = cgpas[cgpas.length - 2];
                                const diff = last - secondLast;
                                
                                if (diff > 0.3) {
                                  return (
                                    <span className="badge bg-success d-flex align-items-center gap-1">
                                      <ArrowUp size={14} /> 
                                      Improving (+{diff.toFixed(2)})
                                    </span>
                                  );
                                } else if (diff < -0.3) {
                                  return (
                                    <span className="badge bg-danger d-flex align-items-center gap-1">
                                      <ArrowDown size={14} /> 
                                      Declining ({diff.toFixed(2)})
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="badge bg-secondary d-flex align-items-center gap-1">
                                      <Minus size={14} /> 
                                      Stable ({diff >= 0 ? '+' : ''}{diff.toFixed(2)})
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Insights */}
                      {prediction.insights && (
                        <div 
                          className={`alert alert-${
                            prediction.insights.status === 'excellent' ? 'success' : 
                            prediction.insights.status === 'good' ? 'primary' : 
                            prediction.insights.status === 'average' ? 'warning' : 'danger'
                          } text-start`}
                        >
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <CheckCircle size={18} />
                            <strong className="text-capitalize">
                              {prediction.insights.status}
                            </strong>
                          </div>
                          <small>{prediction.insights.message}</small>
                        </div>
                      )}

                      <button 
                        className="btn btn-outline-secondary mt-2"
                        onClick={handlePredict}
                        disabled={predicting}
                      >
                        <RefreshCw size={16} className="me-2" />
                        Predict Again
                      </button>
                    </>
                  ) : (
                    /* ── Prediction Failed ── */
                    <div className="text-danger">
                      <AlertCircle size={48} className="mb-3" />
                      <h5>Prediction Failed</h5>
                      <p>{prediction.message}</p>
                      <button 
                        className="btn btn-outline-primary"
                        onClick={handlePredict}
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>

        {/* Performance Status — NO CHANGES */}
        <Col lg={6}>
          <div className="card-modern h-100">
            <div className="card-header-modern">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <Target size={20} className="text-success" />
                Performance Status
              </h5>
            </div>
            <div className="card-body-modern">
              {analytics && (
                <>
                  <div className="text-center mb-4">
                    <span 
                      className={`badge bg-${
                        analytics.performanceStatus === 'Excellent' ? 'success' : 
                        analytics.performanceStatus === 'Good' ? 'primary' : 
                        analytics.performanceStatus === 'Average' ? 'warning' : 'danger'
                      } px-4 py-2 fs-6`}
                    >
                      {analytics.performanceStatus}
                    </span>
                  </div>

                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="p-3 rounded text-center" 
                           style={{ background: "rgba(59, 130, 246, 0.1)" }}>
                        <div className="h4 fw-bold text-primary mb-0">
                          {analytics.totalSubjects}
                        </div>
                        <small className="text-muted">Total Subjects</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 rounded text-center" 
                           style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                        <div className="h4 fw-bold text-success mb-0">
                          {analytics.classesAttended}
                        </div>
                        <small className="text-muted">Classes Attended</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 rounded text-center" 
                           style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                        <div className="h4 fw-bold text-warning mb-0">
                          {analytics.totalClasses}
                        </div>
                        <small className="text-muted">Total Classes</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-3 rounded text-center" 
                           style={{ background: "rgba(139, 92, 246, 0.1)" }}>
                        <div className="h4 fw-bold" style={{ color: "#8b5cf6" }}>
                          {analytics.currentCGPA?.toFixed(2) || "N/A"}
                        </div>
                        <small className="text-muted">CGPA</small>
                      </div>
                    </Col>
                  </Row>

                  {analytics.attendanceRate < 75 && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 mt-3 mb-0">
                      <AlertCircle size={18} />
                      <small>
                        Attendance below 75%. Improve to maintain eligibility.
                      </small>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Performance Trends — NO CHANGES */}
      {trends?.semesterTrend && trends.semesterTrend.length > 0 && (
        <div className="card-modern">
          <div className="card-header-modern">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <BarChart2 size={20} className="text-info" />
                Semester-wise Performance Trend
              </h5>
              {trends.improving !== undefined && (
                <span className={`badge bg-${trends.improving ? 'success' : 'warning'} d-flex align-items-center gap-1`}>
                  {getTrendIcon(trends.improving ? 'improving' : 'declining')}
                  {trends.improving ? 'Improving' : 'Needs Attention'}
                  ({trends.improvementRate > 0 ? '+' : ''}{trends.improvementRate?.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
          <div className="card-body-modern">
            <Row className="g-3">
              {trends.semesterTrend.map((sem, index) => (
                <Col xs={6} md={3} lg key={index}>
                  <div 
                    className="p-3 rounded text-center position-relative"
                    style={{ 
                      background: `linear-gradient(180deg, rgba(${
                        sem.percentage >= 75 ? '16, 185, 129' : 
                        sem.percentage >= 60 ? '245, 158, 11' : '239, 68, 68'
                      }, 0.1) 0%, rgba(255,255,255,0) 100%)`
                    }}
                  >
                    <small className="text-muted">Semester {sem.semester}</small>
                    <div className={`h3 fw-bold mb-0 text-${getStatusColor(sem.percentage, 'percentage')}`}>
                      {sem.percentage?.toFixed(1)}%
                    </div>
                    <div className="progress mt-2" style={{ height: "4px" }}>
                      <div 
                        className={`progress-bar bg-${getStatusColor(sem.percentage, 'percentage')}`}
                        style={{ width: `${sem.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            <div className="alert alert-info d-flex align-items-center gap-2 mt-3 mb-0">
              <Info size={18} />
              <small>
                This chart shows your average percentage across each semester. 
                Consistent improvement leads to better CGPA predictions.
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CGPAPrediction;