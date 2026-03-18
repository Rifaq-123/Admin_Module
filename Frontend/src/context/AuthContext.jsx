// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { setAuthToken } from "../api/axiosInstance";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const savedRole = localStorage.getItem("role");

        if (token && savedUser && savedRole) {
          // Check if token is expired
          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && decoded.exp < currentTime) {
              // Token expired
              console.log("🔐 Token expired, clearing auth...");
              clearAuth();
              return;
            }

            // Token valid - restore session
            setAuthToken(token);
            setUser(JSON.parse(savedUser));
            setRole(savedRole);
            setIsAuthenticated(true);
            console.log("✅ Auth restored from localStorage");

          } catch (decodeError) {
            console.error("❌ Invalid token format:", decodeError);
            clearAuth();
          }
        }
      } catch (err) {
        console.error("❌ Failed to initialize auth:", err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Clear all auth state
  const clearAuth = useCallback(() => {
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    setAuthToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  }, []);

  // ✅ Login function
  const login = useCallback(async (userData, userRole, token) => {
    try {
      // Validate inputs
      if (!userData || !userRole || !token) {
        throw new Error("Invalid login data");
      }

      // Set token in axios
      setAuthToken(token);
      
      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", userRole);
      
      // Update state
      setUser(userData);
      setRole(userRole);
      setIsAuthenticated(true);
      
      console.log("✅ Login successful:", userRole);
      return true;
      
    } catch (error) {
      console.error("❌ Login error:", error);
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  // ✅ Logout function - redirects to HOME page
  const logout = useCallback(() => {
    console.log("🚪 Logging out...");
    clearAuth();
    window.location.href = "/";
  }, [clearAuth]);

  // ✅ Check if user has specific role
  const hasRole = useCallback((requiredRole) => {
    return role === requiredRole;
  }, [role]);

  // ✅ Get user ID safely
  const getUserId = useCallback(() => {
    return user?.id || null;
  }, [user]);

  // ✅ Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    role,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    clearAuth,
    getUserId
  }), [user, role, loading, isAuthenticated, login, logout, hasRole, clearAuth, getUserId]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;