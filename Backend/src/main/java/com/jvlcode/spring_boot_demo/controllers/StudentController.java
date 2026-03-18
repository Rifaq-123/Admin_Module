package com.jvlcode.spring_boot_demo.controllers;

import com.jvlcode.spring_boot_demo.entity.Attendance;
import com.jvlcode.spring_boot_demo.entity.Marks;
import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.entity.StudyMaterial;
import com.jvlcode.spring_boot_demo.exception.RateLimitExceededException;
import com.jvlcode.spring_boot_demo.security.JwtUtil;
import com.jvlcode.spring_boot_demo.security.RateLimiterService;
import com.jvlcode.spring_boot_demo.services.StudentService;
import com.jvlcode.spring_boot_demo.services.StudyMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudyMaterialService studyMaterialService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private RateLimiterService rateLimiter;

    // ===============================
    // 🔐 Student Login
    // ===============================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        String email = creds.get("email");

        if (!rateLimiter.isAllowed(email)) {
            long seconds = rateLimiter.getSecondsUntilReset(email);
            throw new RateLimitExceededException(
                    "Too many login attempts. Try again in " + seconds + " seconds.");
        }

        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, creds.get("password"))
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);
            Student student = studentService.getStudentByEmail(email);

            rateLimiter.resetLimit(email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("email", userDetails.getUsername());
            response.put("id", student.getId());
            response.put("name", student.getName());
            response.put("rollNo", student.getRollNo());
            response.put("department", student.getDepartment() != null ? student.getDepartment() : "");
            response.put("course", student.getCourse() != null ? student.getCourse() : "");
            response.put("role", "STUDENT");

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid email or password",
                    "remainingAttempts", rateLimiter.getRemainingAttempts(email)
            ));
        }
    }

    // ===============================
    // 📊 Dashboard Stats
    // ===============================
    @GetMapping("/dashboard/stats/{studentId}")
    public ResponseEntity<?> getDashboardStats(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.getDashboardStats(studentId));
    }

    // ===============================
    // 👤 Profile Management
    // ===============================
    @GetMapping("/profile/{studentId}")
    public ResponseEntity<?> getProfile(@PathVariable Long studentId) {
        Student student = studentService.getProfile(studentId);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/profile/{studentId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> profileData
    ) {
        try {
            Student updated = studentService.updateProfile(studentId, profileData);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "student", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/profile/{studentId}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long studentId,
            @RequestBody Map<String, String> passwordData
    ) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            studentService.changePassword(studentId, currentPassword, newPassword);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password changed successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // ===============================
    // 📋 Attendance - View Records
    // ===============================
    @GetMapping("/attendance/{studentId}")
    public ResponseEntity<?> getMyAttendance(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Page<Attendance> attendance = studentService.getAttendancePaginated(studentId, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", attendance.getContent());
        response.put("currentPage", attendance.getNumber());
        response.put("totalItems", attendance.getTotalElements());
        response.put("totalPages", attendance.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/attendance/{studentId}/summary")
    public ResponseEntity<?> getAttendanceSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.getAttendanceSummary(studentId));
    }

    @GetMapping("/attendance/{studentId}/subject/{subject}")
    public ResponseEntity<?> getAttendanceBySubject(
            @PathVariable Long studentId,
            @PathVariable String subject
    ) {
        return ResponseEntity.ok(studentService.getAttendanceBySubject(studentId, subject));
    }

    // ===============================
    // 📝 Marks - View Records
    // ===============================
    @GetMapping("/marks/{studentId}")
    public ResponseEntity<?> getMyMarks(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Page<Marks> marks = studentService.getMarksPaginated(studentId, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", marks.getContent());
        response.put("currentPage", marks.getNumber());
        response.put("totalItems", marks.getTotalElements());
        response.put("totalPages", marks.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/marks/{studentId}/semester/{semester}")
    public ResponseEntity<?> getMarksBySemester(
            @PathVariable Long studentId,
            @PathVariable Integer semester
    ) {
        return ResponseEntity.ok(studentService.getMarksBySemester(studentId, semester));
    }

    @GetMapping("/marks/{studentId}/summary")
    public ResponseEntity<?> getMarksSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.getMarksSummary(studentId));
    }

    // ===============================
    // 🎯 CGPA Calculation & Prediction
    // ===============================
    @GetMapping("/cgpa/current/{studentId}")
    public ResponseEntity<?> getCurrentCGPA(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.calculateCurrentCGPA(studentId));
    }

    @GetMapping("/cgpa/predict/{studentId}")
    public ResponseEntity<?> predictCGPA(@PathVariable Long studentId) {
        try {
            Map<String, Object> prediction = studentService.predictCGPA(studentId);
            return ResponseEntity.ok(prediction);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error predicting CGPA: " + e.getMessage()
            ));
        }
    }

    // ===============================
    // 📊 Performance Analytics
    // ===============================
    @GetMapping("/performance/{studentId}")
    public ResponseEntity<?> getPerformanceAnalytics(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.getPerformanceAnalytics(studentId));
    }

    @GetMapping("/performance/{studentId}/trends")
    public ResponseEntity<?> getPerformanceTrends(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.getPerformanceTrends(studentId));
    }

    // ===============================
    // 📚 Study Materials - View & Download
    // ===============================
    @GetMapping("/materials")
    public ResponseEntity<?> getAllMaterials(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<StudyMaterial> materials = studentService.getAllMaterialsPaginated(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", materials.getContent());
        response.put("currentPage", materials.getNumber());
        response.put("totalItems", materials.getTotalElements());
        response.put("totalPages", materials.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/materials/subject/{subject}")
    public ResponseEntity<?> getMaterialsBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(studentService.getMaterialsBySubject(subject));
    }

    @GetMapping("/materials/search")
    public ResponseEntity<?> searchMaterials(@RequestParam String query) {
        return ResponseEntity.ok(studentService.searchMaterials(query));
    }

    @GetMapping("/materials/{materialId}")
    public ResponseEntity<?> getMaterialById(@PathVariable Long materialId) {
        StudyMaterial material = studyMaterialService.getMaterialById(materialId);
        return ResponseEntity.ok(material);
    }

    @GetMapping("/materials/{materialId}/download")
    public ResponseEntity<Resource> downloadMaterial(@PathVariable Long materialId) {
        try {
            StudyMaterial material = studyMaterialService.getMaterialById(materialId);
            Resource resource = studyMaterialService.downloadMaterial(materialId);

            String contentType = getContentType(material.getFileType());
            String encodedFileName = URLEncoder.encode(
                    material.getFileName(),
                    StandardCharsets.UTF_8
            ).replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + material.getFileName() +
                                    "\"; filename*=UTF-8''" + encodedFileName)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(material.getFileSize()))
                    .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
                            "Content-Disposition, Content-Length, Content-Type")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header(HttpHeaders.EXPIRES, "0")
                    .body(resource);

        } catch (Exception e) {
            System.err.println("❌ Download error for material " + materialId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    // ===============================
    // 📄 Reports Generation
    // ===============================
    @GetMapping("/reports/academic/{studentId}")
    public ResponseEntity<Resource> downloadAcademicReport(@PathVariable Long studentId) {
        try {
            Resource report = studentService.generateAcademicReport(studentId);
            Student student = studentService.getProfile(studentId);

            String filename = "Academic_Report_" + student.getRollNo() + ".pdf";
            String encodedFileName = URLEncoder.encode(filename, StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename +
                                    "\"; filename*=UTF-8''" + encodedFileName)
                    .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
                            "Content-Disposition, Content-Length, Content-Type")
                    .body(report);

        } catch (Exception e) {
            System.err.println("❌ Report generation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/reports/attendance/{studentId}")
    public ResponseEntity<Resource> downloadAttendanceReport(@PathVariable Long studentId) {
        try {
            Resource report = studentService.generateAttendanceReport(studentId);
            Student student = studentService.getProfile(studentId);

            String filename = "Attendance_Report_" + student.getRollNo() + ".pdf";
            String encodedFileName = URLEncoder.encode(filename, StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename +
                                    "\"; filename*=UTF-8''" + encodedFileName)
                    .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
                            "Content-Disposition, Content-Length, Content-Type")
                    .body(report);

        } catch (Exception e) {
            System.err.println("❌ Report generation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    // ===============================
    // 🔧 Helper Methods
    // ===============================
    private String getContentType(String fileExtension) {
        if (fileExtension == null) {
            return "application/octet-stream";
        }

        return switch (fileExtension.toLowerCase()) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "txt" -> "text/plain";
            case "zip" -> "application/zip";
            case "rar" -> "application/x-rar-compressed";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            default -> "application/octet-stream";
        };
    }
}