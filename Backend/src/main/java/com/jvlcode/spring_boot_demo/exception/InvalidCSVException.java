package com.jvlcode.spring_boot_demo.exception;

public class InvalidCSVException extends RuntimeException {
    
    public InvalidCSVException(String message) {
        super(message);
    }
}