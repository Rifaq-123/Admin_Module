// components/LoadingFallback.jsx
import React from "react";

const LoadingFallback = ({ message = "Loading..." }) => {
  return (
    <div 
      className="d-flex flex-column align-items-center justify-content-center min-vh-100"
      style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
      }}
    >
      {/* Spinner */}
      <div className="spinner-border text-white mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      
      {/* Loading Text */}
      <h5 className="text-white mb-2">{message}</h5>
      <p className="text-white-50 small">Please wait...</p>
    </div>
  );
};

export default LoadingFallback;