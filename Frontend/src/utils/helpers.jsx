// utils/helpers.js

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

/**
 * Format date to readable string
 */
export const formatDateReadable = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (obtained, total) => {
  if (!total || total === 0) return 0;
  return Math.round((obtained / total) * 100 * 100) / 100;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Download CSV template
 */
export const downloadCSVTemplate = (filename, content) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Get grade from percentage
 */
export const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: "A+", color: "success" };
  if (percentage >= 80) return { grade: "A", color: "success" };
  if (percentage >= 70) return { grade: "B+", color: "info" };
  if (percentage >= 60) return { grade: "B", color: "info" };
  if (percentage >= 50) return { grade: "C", color: "warning" };
  if (percentage >= 40) return { grade: "D", color: "warning" };
  return { grade: "F", color: "danger" };
};