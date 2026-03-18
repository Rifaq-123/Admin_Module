package com.jvlcode.spring_boot_demo.exception;

public class StudentNotFoundException extends RuntimeException {
    
    public StudentNotFoundException(Long id) {
        super("Student not found with ID: " + id);
    }

    public StudentNotFoundException(String field, String value) {
        super("Student not found with " + field + ": " + value);
    }

    public StudentNotFoundException(String message) {
        super(message);
    }
}