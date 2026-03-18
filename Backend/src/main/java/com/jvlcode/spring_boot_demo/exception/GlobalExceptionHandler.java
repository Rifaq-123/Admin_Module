package com.jvlcode.spring_boot_demo.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ✅ Handle Validation Errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", "Validation failed",
            "errors", errors,
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ Handle Student Not Found
    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<?> handleStudentNotFound(StudentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
            "success", false,
            "message", ex.getMessage(),
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ Handle Teacher Not Found
    @ExceptionHandler(TeacherNotFoundException.class)
    public ResponseEntity<?> handleTeacherNotFound(TeacherNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
            "success", false,
            "message", ex.getMessage(),
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ Handle Duplicate Attendance
    @ExceptionHandler(DuplicateAttendanceException.class)
    public ResponseEntity<?> handleDuplicateAttendance(DuplicateAttendanceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
            "success", false,
            "message", ex.getMessage(),
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ Handle Duplicate Email
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<?> handleDuplicateEmail(DuplicateEmailException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
            "success", false,
            "message", ex.getMessage(),
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ Handle Bad Credentials
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
            "success", false,
            "message", "Invalid username or password",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ Handle Database Constraint Violations
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = "Data integrity violation";
        
        String exMessage = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        if (exMessage.contains("email")) {
            message = "Email already exists";
        } else if (exMessage.contains("roll")) {
            message = "Roll number already exists";
        } else if (exMessage.contains("unique") || exMessage.contains("duplicate")) {
            message = "A record with this information already exists";
        }
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
            "success", false,
            "message", message,
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ Handle File Upload Size Exceeded
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", "File size exceeds the maximum limit (5MB)",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ Handle Runtime Exceptions
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        ex.printStackTrace(); // Log for debugging
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
            "success", false,
            "message", ex.getMessage() != null ? ex.getMessage() : "An error occurred",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ✅ Handle Generic Exceptions (Fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        ex.printStackTrace(); // Log for debugging
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
            "success", false,
            "message", "An unexpected error occurred. Please try again later.",
            "error", ex.getClass().getSimpleName(),
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}