package com.jvlcode.spring_boot_demo.exception;

public class DuplicateAttendanceException extends RuntimeException {
    
    public DuplicateAttendanceException(String message) {
        super(message);
    }
    
    public DuplicateAttendanceException(String rollNo, String date, String subject) {
        super("Attendance already marked for student " + rollNo + " on " + date + " for " + subject);
    }
}