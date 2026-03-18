// utils/validators.js

/**
 * Sanitize string input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[<>"'&]/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .trim();
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

/**
 * Validate roll number format (STU followed by 3+ digits)
 */
export const validateRollNo = (rollNo) => {
  if (!rollNo) return false;
  const re = /^STU\d{3,}$/i;
  return re.test(rollNo.trim());
};

/**
 * Validate phone number (10 digits)
 */
export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const re = /^\d{10}$/;
  return re.test(phone.replace(/\D/g, ''));
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: "Password is required" };
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  return { valid: true, message: "" };
};

/**
 * Validate marks
 */
export const validateMarks = (obtained, total) => {
  const obt = parseFloat(obtained);
  const tot = parseFloat(total);
  
  if (isNaN(obt) || isNaN(tot)) {
    return { valid: false, message: "Marks must be valid numbers" };
  }
  if (obt < 0) {
    return { valid: false, message: "Marks cannot be negative" };
  }
  if (tot <= 0) {
    return { valid: false, message: "Total marks must be greater than 0" };
  }
  if (obt > tot) {
    return { valid: false, message: "Marks obtained cannot exceed total marks" };
  }
  return { valid: true, message: "" };
};

/**
 * Validate date (not in future)
 */
export const validateDate = (dateStr) => {
  if (!dateStr) return { valid: false, message: "Date is required" };
  
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (isNaN(date.getTime())) {
    return { valid: false, message: "Invalid date format" };
  }
  if (date > today) {
    return { valid: false, message: "Date cannot be in the future" };
  }
  return { valid: true, message: "" };
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = "Field") => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: "" };
};

/**
 * Validate semester (1-8)
 */
export const validateSemester = (semester) => {
  const sem = parseInt(semester);
  if (isNaN(sem) || sem < 1 || sem > 8) {
    return { valid: false, message: "Semester must be between 1 and 8" };
  }
  return { valid: true, message: "" };
};