package com.jvlcode.spring_boot_demo.services;

import com.jvlcode.spring_boot_demo.entity.Attendance;
import com.jvlcode.spring_boot_demo.entity.Marks;
import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.entity.StudyMaterial;
import com.jvlcode.spring_boot_demo.exception.StudentNotFoundException;
import com.jvlcode.spring_boot_demo.repository.AttendanceRepository;
import com.jvlcode.spring_boot_demo.repository.MarksRepository;
import com.jvlcode.spring_boot_demo.repository.StudentRepository;
import com.jvlcode.spring_boot_demo.repository.StudyMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    @Autowired
    private MLServiceClient mlServiceClient;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ===============================
    // 👤 Student Profile
    // ===============================

    @Transactional(readOnly = true)
    public Student getStudentByEmail(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public Student getProfile(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(studentId));
    }

    @Transactional
    public Student updateProfile(Long studentId, Map<String, Object> profileData) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(studentId));

        // Update allowed fields
        if (profileData.containsKey("name")) {
            student.setName((String) profileData.get("name"));
        }
        if (profileData.containsKey("phone")) {
            student.setPhone((String) profileData.get("phone"));
        }
        if (profileData.containsKey("address")) {
            student.setAddress((String) profileData.get("address"));
        }
        if (profileData.containsKey("city")) {
            student.setCity((String) profileData.get("city"));
        }
        if (profileData.containsKey("state")) {
            student.setState((String) profileData.get("state"));
        }
        if (profileData.containsKey("country")) {
            student.setCountry((String) profileData.get("country"));
        }

        return studentRepository.save(student);
    }

    @Transactional
    public boolean changePassword(Long studentId, String currentPassword, String newPassword) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(studentId));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, student.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        // Update password
        student.setPassword(passwordEncoder.encode(newPassword));
        studentRepository.save(student);

        return true;
    }

    // ===============================
    // 📊 Dashboard Stats
    // ===============================

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats(Long studentId) {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Verify student exists
            if (!studentRepository.existsById(studentId)) {
                throw new StudentNotFoundException(studentId);
            }

            // Total attendance records
            long totalAttendanceRecords = attendanceRepository.countByStudentId(studentId);
            long presentCount = attendanceRepository.countPresentByStudentId(studentId);
            long absentCount = totalAttendanceRecords - presentCount;

            // Attendance percentage
            double attendancePercentage = totalAttendanceRecords > 0
                    ? (double) presentCount / totalAttendanceRecords * 100
                    : 0;

            // Total marks records
            long totalMarksRecords = marksRepository.countByStudentId(studentId);

            // Current CGPA
            Double currentCGPA = marksRepository.calculateCGPA(studentId);

            stats.put("totalAttendanceRecords", totalAttendanceRecords);
            stats.put("presentCount", presentCount);
            stats.put("absentCount", absentCount);
            stats.put("attendancePercentage", Math.round(attendancePercentage * 100.0) / 100.0);
            stats.put("totalMarksRecords", totalMarksRecords);
            stats.put("currentCGPA", currentCGPA != null ? Math.round(currentCGPA * 100.0) / 100.0 : 0.0);

        } catch (StudentNotFoundException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            // Return default values on error
            stats.put("totalAttendanceRecords", 0L);
            stats.put("presentCount", 0L);
            stats.put("absentCount", 0L);
            stats.put("attendancePercentage", 0.0);
            stats.put("totalMarksRecords", 0L);
            stats.put("currentCGPA", 0.0);
        }

        return stats;
    }

    // ===============================
    // 📋 Attendance - View Records
    // ===============================

    @Transactional(readOnly = true)
    public List<Attendance> getAttendance(Long studentId) {
        return attendanceRepository.findByStudentIdOptimized(studentId);
    }

    @Transactional(readOnly = true)
    public Page<Attendance> getAttendancePaginated(Long studentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        
        // Create custom paginated query
        List<Attendance> allAttendance = attendanceRepository.findByStudentIdOptimized(studentId);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allAttendance.size());
        
        List<Attendance> pageContent = allAttendance.subList(start, end);
        
        return new org.springframework.data.domain.PageImpl<>(
            pageContent, pageable, allAttendance.size()
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceSummary(Long studentId) {
        List<Attendance> attendance = attendanceRepository.findByStudentId(studentId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRecords", attendance.size());

        long presentCount = attendance.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsPresent()))
                .count();
        long absentCount = attendance.size() - presentCount;

        summary.put("presentCount", presentCount);
        summary.put("absentCount", absentCount);

        double attendancePercentage = attendance.isEmpty() ? 0 :
                (double) presentCount / attendance.size() * 100;
        summary.put("attendancePercentage", Math.round(attendancePercentage * 100.0) / 100.0);

        // Subject-wise breakdown
        Map<String, Map<String, Object>> subjectWise = new HashMap<>();
        Map<String, List<Attendance>> groupedBySubject = attendance.stream()
                .collect(Collectors.groupingBy(Attendance::getSubject));

        groupedBySubject.forEach((subject, records) -> {
            long subjectPresent = records.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsPresent()))
                    .count();
            double subjectPercentage = (double) subjectPresent / records.size() * 100;

            Map<String, Object> subjectStats = new HashMap<>();
            subjectStats.put("total", records.size());
            subjectStats.put("present", subjectPresent);
            subjectStats.put("absent", records.size() - subjectPresent);
            subjectStats.put("percentage", Math.round(subjectPercentage * 100.0) / 100.0);

            subjectWise.put(subject, subjectStats);
        });

        summary.put("subjectWise", subjectWise);

        return summary;
    }

    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceBySubject(Long studentId, String subject) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .filter(a -> a.getSubject().equalsIgnoreCase(subject))
                .sorted(Comparator.comparing(Attendance::getDate).reversed())
                .collect(Collectors.toList());
    }

    // ===============================
    // 📝 Marks - View Records
    // ===============================

    @Transactional(readOnly = true)
    public List<Marks> getMarks(Long studentId) {
        return marksRepository.findByStudentIdOptimized(studentId);
    }

    @Transactional(readOnly = true)
    public Page<Marks> getMarksPaginated(Long studentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("semester").ascending());
        
        List<Marks> allMarks = marksRepository.findByStudentIdOptimized(studentId);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allMarks.size());
        
        List<Marks> pageContent = allMarks.subList(start, end);
        
        return new org.springframework.data.domain.PageImpl<>(
            pageContent, pageable, allMarks.size()
        );
    }

    @Transactional(readOnly = true)
    public List<Marks> getMarksBySemester(Long studentId, Integer semester) {
        return marksRepository.findByStudentIdAndSemester(studentId, semester);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMarksSummary(Long studentId) {
        List<Marks> marks = marksRepository.findByStudentId(studentId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRecords", marks.size());

        // Overall statistics
        double totalPercentage = marks.stream()
                .mapToDouble(m -> (m.getMarksObtained() / m.getTotalMarks()) * 100)
                .average()
                .orElse(0.0);

        summary.put("overallPercentage", Math.round(totalPercentage * 100.0) / 100.0);

        // Semester-wise breakdown
        Map<Integer, Map<String, Object>> semesterWise = new HashMap<>();
        Map<Integer, List<Marks>> groupedBySemester = marks.stream()
                .collect(Collectors.groupingBy(Marks::getSemester));

        groupedBySemester.forEach((semester, records) -> {
            double semPercentage = records.stream()
                    .mapToDouble(m -> (m.getMarksObtained() / m.getTotalMarks()) * 100)
                    .average()
                    .orElse(0.0);

            double semCGPA = records.stream()
                    .mapToDouble(m -> (m.getMarksObtained() / m.getTotalMarks()) * 10)
                    .average()
                    .orElse(0.0);

            Map<String, Object> semStats = new HashMap<>();
            semStats.put("totalSubjects", records.size());
            semStats.put("percentage", Math.round(semPercentage * 100.0) / 100.0);
            semStats.put("cgpa", Math.round(semCGPA * 100.0) / 100.0);

            semesterWise.put(semester, semStats);
        });

        summary.put("semesterWise", semesterWise);

        return summary;
    }

    // ===============================
    // 🎯 CGPA Calculation & Prediction
    // ===============================

    @Transactional(readOnly = true)
    public Map<String, Object> calculateCurrentCGPA(Long studentId) {
        Map<String, Object> result = new HashMap<>();

        Double cgpa = marksRepository.calculateCGPA(studentId);
        List<Marks> marks = marksRepository.findByStudentId(studentId);

        result.put("currentCGPA", cgpa != null ? Math.round(cgpa * 100.0) / 100.0 : 0.0);
        result.put("totalSubjects", marks.size());
        result.put("completedSemesters", marks.stream()
                .map(Marks::getSemester)
                .distinct()
                .count());

        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> predictCGPA(Long studentId) {
        List<Marks> marks = marksRepository.findByStudentIdOptimized(studentId);

        if (marks.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "No marks data available for prediction");
            return error;
        }

        // Call ML service
        return mlServiceClient.predictCGPA(marks);
    }

    // ===============================
    // 📊 Performance Analytics
    // ===============================

    @Transactional(readOnly = true)
    public Map<String, Object> getPerformanceAnalytics(Long studentId) {
        Map<String, Object> analytics = new HashMap<>();

        List<Marks> marks = marksRepository.findByStudentId(studentId);
        List<Attendance> attendance = attendanceRepository.findByStudentId(studentId);

        // Academic performance
        double avgPercentage = marks.stream()
                .mapToDouble(m -> (m.getMarksObtained() / m.getTotalMarks()) * 100)
                .average()
                .orElse(0.0);

        analytics.put("averagePercentage", Math.round(avgPercentage * 100.0) / 100.0);
        analytics.put("totalSubjects", marks.size());
        analytics.put("currentCGPA", marksRepository.calculateCGPA(studentId));

        // Attendance performance
        long presentCount = attendance.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsPresent()))
                .count();

        double attendanceRate = attendance.isEmpty() ? 0 :
                (double) presentCount / attendance.size() * 100;

        analytics.put("attendanceRate", Math.round(attendanceRate * 100.0) / 100.0);
        analytics.put("totalClasses", attendance.size());
        analytics.put("classesAttended", presentCount);

        // Performance status
        String performanceStatus;
        if (avgPercentage >= 75 && attendanceRate >= 75) {
            performanceStatus = "Excellent";
        } else if (avgPercentage >= 60 && attendanceRate >= 60) {
            performanceStatus = "Good";
        } else if (avgPercentage >= 50 && attendanceRate >= 50) {
            performanceStatus = "Average";
        } else {
            performanceStatus = "Needs Improvement";
        }

        analytics.put("performanceStatus", performanceStatus);

        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPerformanceTrends(Long studentId) {
        Map<String, Object> trends = new HashMap<>();

        List<Marks> marks = marksRepository.findByStudentId(studentId);

        // Semester-wise trend
        Map<Integer, Double> semesterTrend = marks.stream()
                .collect(Collectors.groupingBy(
                        Marks::getSemester,
                        Collectors.averagingDouble(m -> (m.getMarksObtained() / m.getTotalMarks()) * 100)
                ));

        List<Map<String, Object>> trendData = semesterTrend.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("semester", entry.getKey());
                    data.put("percentage", Math.round(entry.getValue() * 100.0) / 100.0);
                    return data;
                })
                .collect(Collectors.toList());

        trends.put("semesterTrend", trendData);

        // Calculate improvement rate
        if (trendData.size() >= 2) {
            double firstSem = (double) trendData.get(0).get("percentage");
            double lastSem = (double) trendData.get(trendData.size() - 1).get("percentage");
            double improvement = lastSem - firstSem;

            trends.put("improvementRate", Math.round(improvement * 100.0) / 100.0);
            trends.put("improving", improvement > 0);
        }

        return trends;
    }

    // ===============================
    // 📚 Study Materials
    // ===============================

    @Transactional(readOnly = true)
    public List<StudyMaterial> getAllMaterials() {
        return studyMaterialRepository.findAllPublic();
    }

    @Transactional(readOnly = true)
    public Page<StudyMaterial> getAllMaterialsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        List<StudyMaterial> allMaterials = studyMaterialRepository.findAllPublic();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allMaterials.size());
        
        List<StudyMaterial> pageContent = allMaterials.subList(start, end);
        
        return new org.springframework.data.domain.PageImpl<>(
            pageContent, pageable, allMaterials.size()
        );
    }

    @Transactional(readOnly = true)
    public List<StudyMaterial> getMaterialsBySubject(String subject) {
        return studyMaterialRepository.findBySubjectOrderByCreatedAtDesc(subject);
    }

    @Transactional(readOnly = true)
    public List<StudyMaterial> searchMaterials(String query) {
        return studyMaterialRepository.searchMaterials(query);
    }

    // ===============================
    // 📄 Report Generation
    // ===============================

    @Transactional(readOnly = true)
    public Resource generateAcademicReport(Long studentId) {
        Student student = getProfile(studentId);
        List<Marks> marks = marksRepository.findByStudentId(studentId);
        List<Attendance> attendance = attendanceRepository.findByStudentId(studentId);

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            // Simple text-based report (you can replace with PDF library later)
            StringBuilder report = new StringBuilder();
            report.append("ACADEMIC REPORT\n");
            report.append("=".repeat(50)).append("\n\n");
            report.append("Student Name: ").append(student.getName()).append("\n");
            report.append("Roll Number: ").append(student.getRollNo()).append("\n");
            report.append("Email: ").append(student.getEmail()).append("\n");
            report.append("Department: ").append(student.getDepartment()).append("\n");
            report.append("Course: ").append(student.getCourse()).append("\n");
            report.append("\n").append("=".repeat(50)).append("\n\n");

            // CGPA
            Double cgpa = marksRepository.calculateCGPA(studentId);
            report.append("Current CGPA: ").append(cgpa != null ? String.format("%.2f", cgpa) : "N/A").append("\n\n");

            // Marks Summary
            report.append("MARKS SUMMARY\n");
            report.append("-".repeat(50)).append("\n");
            marks.stream()
                    .sorted(Comparator.comparing(Marks::getSemester).thenComparing(Marks::getSubject))
                    .forEach(m -> {
                        double percentage = (m.getMarksObtained() / m.getTotalMarks()) * 100;
                        report.append(String.format("Sem %d | %s | %s | %.2f/%.2f (%.2f%%)\n",
                                m.getSemester(),
                                m.getSubject(),
                                m.getExamType(),
                                m.getMarksObtained(),
                                m.getTotalMarks(),
                                percentage
                        ));
                    });

            // Attendance Summary
            long presentCount = attendance.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsPresent()))
                    .count();
            double attendancePercentage = attendance.isEmpty() ? 0 :
                    (double) presentCount / attendance.size() * 100;

            report.append("\n").append("=".repeat(50)).append("\n\n");
            report.append("ATTENDANCE SUMMARY\n");
            report.append("-".repeat(50)).append("\n");
            report.append(String.format("Total Classes: %d\n", attendance.size()));
            report.append(String.format("Classes Attended: %d\n", presentCount));
            report.append(String.format("Attendance Percentage: %.2f%%\n", attendancePercentage));

            report.append("\n").append("=".repeat(50)).append("\n");
            report.append("Generated on: ").append(LocalDate.now().format(DateTimeFormatter.ISO_DATE)).append("\n");

            outputStream.write(report.toString().getBytes());
            byte[] data = outputStream.toByteArray();

            return new ByteArrayResource(data);

        } catch (Exception e) {
            throw new RuntimeException("Error generating academic report: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Resource generateAttendanceReport(Long studentId) {
        Student student = getProfile(studentId);
        List<Attendance> attendance = attendanceRepository.findByStudentId(studentId);

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            StringBuilder report = new StringBuilder();
            report.append("ATTENDANCE REPORT\n");
            report.append("=".repeat(50)).append("\n\n");
            report.append("Student Name: ").append(student.getName()).append("\n");
            report.append("Roll Number: ").append(student.getRollNo()).append("\n");
            report.append("Email: ").append(student.getEmail()).append("\n\n");
            report.append("=".repeat(50)).append("\n\n");

            // Overall stats
            long presentCount = attendance.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsPresent()))
                    .count();
            double percentage = attendance.isEmpty() ? 0 :
                    (double) presentCount / attendance.size() * 100;

            report.append(String.format("Overall Attendance: %.2f%%\n", percentage));
            report.append(String.format("Total Classes: %d\n", attendance.size()));
            report.append(String.format("Present: %d | Absent: %d\n\n", presentCount, attendance.size() - presentCount));

            // Detailed records
            report.append("DETAILED RECORDS\n");
            report.append("-".repeat(50)).append("\n");
            attendance.stream()
                    .sorted(Comparator.comparing(Attendance::getDate).reversed())
                    .forEach(a -> {
                        report.append(String.format("%s | %s | %s | %s\n",
                                a.getDate(),
                                a.getSubject(),
                                a.getIsPresent() ? "Present" : "Absent",
                                a.getRemarks() != null ? a.getRemarks() : ""
                        ));
                    });

            report.append("\n").append("=".repeat(50)).append("\n");
            report.append("Generated on: ").append(LocalDate.now().format(DateTimeFormatter.ISO_DATE)).append("\n");

            outputStream.write(report.toString().getBytes());
            byte[] data = outputStream.toByteArray();

            return new ByteArrayResource(data);

        } catch (Exception e) {
            throw new RuntimeException("Error generating attendance report: " + e.getMessage(), e);
        }
    }
}