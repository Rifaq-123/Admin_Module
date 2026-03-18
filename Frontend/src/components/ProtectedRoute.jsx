// components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingFallback from "./LoadingFallback";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return <LoadingFallback message="Verifying authentication..." />;
  }

  // Check authentication
  if (!isAuthenticated || !user || !role) {
    console.log("🔐 Not authenticated, redirecting to login...");
    return (
      <Navigate 
        to={`/${allowedRole.toLowerCase()}/login`} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check authorization
  if (role !== allowedRole) {
    console.log(`🚫 Role mismatch: expected ${allowedRole}, got ${role}`);
    
    // Clear invalid session
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    
    return <Navigate to="/" replace />;
  }

  // Authorized - render children
  return children;
};

export default ProtectedRoute;