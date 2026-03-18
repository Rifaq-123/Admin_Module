// components/ErrorBoundary.jsx
import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
    
    // You can log to an error tracking service here
    // logErrorToService(error, errorInfo);
  }

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-vh-100 d-flex align-items-center justify-content-center"
          style={{ 
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" 
          }}
        >
          <div className="text-center p-5" style={{ maxWidth: "600px" }}>
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
              style={{ 
                width: "80px", 
                height: "80px",
                background: "rgba(239, 68, 68, 0.1)"
              }}
            >
              <AlertCircle size={48} className="text-danger" />
            </div>

            <h2 className="mb-3 fw-bold text-dark">
              Oops! Something went wrong
            </h2>
            
            <p className="text-muted mb-4">
              We apologize for the inconvenience. Please try refreshing the page or go back to the home page.
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-start mb-4 p-3 bg-light rounded">
                <summary className="text-danger fw-bold mb-2" style={{ cursor: "pointer" }}>
                  Error Details (Dev Mode)
                </summary>
                <pre className="small mb-0 text-danger" style={{ whiteSpace: "pre-wrap" }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="d-flex gap-3 justify-content-center">
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={this.handleRefresh}
              >
                <RefreshCw size={18} />
                Refresh Page
              </button>
              
              <button 
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={this.handleGoHome}
              >
                <Home size={18} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;