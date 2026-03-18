package com.jvlcode.spring_boot_demo.dto;

public class AttendanceImportDTO {
    
    private String rollNo;
    private String date;
    private String subject;
    private String status;
    private String remarks;

    // Default constructor
    public AttendanceImportDTO() {}

    // All args constructor
    public AttendanceImportDTO(String rollNo, String date, String subject, 
                               String status, String remarks) {
        this.rollNo = rollNo;
        this.date = date;
        this.subject = subject;
        this.status = status;
        this.remarks = remarks;
    }

    // Getters and Setters
    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    // Validation
    public boolean isValid() {
        if (rollNo == null || rollNo.isBlank()) return false;
        if (date == null || date.isBlank()) return false;
        if (subject == null || subject.isBlank()) return false;
        if (status == null || 
            (!status.equalsIgnoreCase("P") && !status.equalsIgnoreCase("A"))) {
            return false;
        }
        return true;
    }

    public String getValidationError() {
        if (rollNo == null || rollNo.isBlank()) return "Roll number is required";
        if (date == null || date.isBlank()) return "Date is required";
        if (subject == null || subject.isBlank()) return "Subject is required";
        if (status == null || 
            (!status.equalsIgnoreCase("P") && !status.equalsIgnoreCase("A"))) {
            return "Status must be 'P' (Present) or 'A' (Absent)";
        }
        return null;
    }

    @Override
    public String toString() {
        return "AttendanceImportDTO{" +
               "rollNo='" + rollNo + '\'' +
               ", date='" + date + '\'' +
               ", subject='" + subject + '\'' +
               ", status='" + status + '\'' +
               ", remarks='" + remarks + '\'' +
               '}';
    }
}