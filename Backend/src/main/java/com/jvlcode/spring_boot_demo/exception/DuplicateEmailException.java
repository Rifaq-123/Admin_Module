package com.jvlcode.spring_boot_demo.exception;

public class DuplicateEmailException extends RuntimeException {
    
    public DuplicateEmailException(String message) {
        super(message);
    }
    
    public DuplicateEmailException(String email, String entityType) {
        super(entityType + " with email '" + email + "' already exists");
    }
}