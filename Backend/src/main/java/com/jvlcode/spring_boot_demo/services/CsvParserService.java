package com.jvlcode.spring_boot_demo.services;

import com.jvlcode.spring_boot_demo.dto.AttendanceImportDTO;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvParserService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Parse CSV file into AttendanceImportDTO objects
     */
    public List<AttendanceImportDTO> parseAttendanceCSV(MultipartFile file) {
        List<AttendanceImportDTO> records = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader,
                CSVFormat.DEFAULT.builder()
                    .setHeader("rollNo", "date", "subject", "status", "remarks")
                    .setSkipHeaderRecord(true)
                    .setIgnoreEmptyLines(true)
                    .setTrim(true)
                    .build())) {

            for (CSVRecord csvRecord : csvParser) {
                try {
                    AttendanceImportDTO dto = new AttendanceImportDTO();
                    dto.setRollNo(getValueSafely(csvRecord, "rollNo"));
                    dto.setDate(getValueSafely(csvRecord, "date"));
                    dto.setSubject(getValueSafely(csvRecord, "subject"));
                    dto.setStatus(getValueSafely(csvRecord, "status"));
                    dto.setRemarks(getValueSafely(csvRecord, "remarks"));
                    records.add(dto);
                } catch (Exception e) {
                    // Skip malformed rows
                    System.err.println("Error parsing CSV row: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage(), e);
        }

        return records;
    }

    /**
     * Safely get value from CSV record
     */
    private String getValueSafely(CSVRecord record, String column) {
        try {
            String value = record.get(column);
            return value != null ? value.trim() : "";
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Validate file before processing
     */
    public void validateCSVFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 5MB limit");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            throw new RuntimeException("File must be a CSV file");
        }
    }
}