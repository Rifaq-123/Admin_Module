package com.jvlcode.spring_boot_demo.dto;

import java.util.ArrayList;
import java.util.List;

public class AttendanceImportResult {
    
    private int totalRecords;
    private int successCount;
    private int failedCount;
    private int skippedCount;
    private List<String> errors;
    private List<String> warnings;

    // Default constructor
    public AttendanceImportResult() {
        this.errors = new ArrayList<>();
        this.warnings = new ArrayList<>();
    }

    // All args constructor
    public AttendanceImportResult(int totalRecords, int successCount, 
                                  int failedCount, List<String> errors) {
        this.totalRecords = totalRecords;
        this.successCount = successCount;
        this.failedCount = failedCount;
        this.errors = errors != null ? errors : new ArrayList<>();
        this.warnings = new ArrayList<>();
    }

    // Getters and Setters
    public int getTotalRecords() { return totalRecords; }
    public void setTotalRecords(int totalRecords) { this.totalRecords = totalRecords; }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }

    public int getFailedCount() { return failedCount; }
    public void setFailedCount(int failedCount) { this.failedCount = failedCount; }

    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }

    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }

    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }
}