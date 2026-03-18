package com.jvlcode.spring_boot_demo.exception;

public class TeacherNotFoundException extends RuntimeException {
    
    public TeacherNotFoundException(String message) {
        super(message);
    }
    
    public TeacherNotFoundException(Long id) {
        super("Teacher not found with ID: " + id);
    }
}