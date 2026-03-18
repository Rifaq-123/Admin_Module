package com.jvlcode.spring_boot_demo.controllers;

import com.jvlcode.spring_boot_demo.dto.AttendanceImportResult;
import com.jvlcode.spring_boot_demo.entity.Attendance;
import com.jvlcode.spring_boot_demo.entity.Marks;
import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.entity.StudyMaterial;
import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.exception.RateLimitExceededException;
import com.jvlcode.spring_boot_demo.security.JwtUtil;
import com.jvlcode.spring_boot_demo.security.RateLimiterService;
import com.jvlcode.spring_boot_demo.services.StudyMaterialService;
import com.jvlcode.spring_boot_demo.services.TeacherService;
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
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private RateLimiterService rateLimiter;

    @Autowired
    private StudyMaterialService studyMaterialService;

    // ===============================
    // 🔐 Teacher Login
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
            Teacher teacher = teacherService.getTeacherByEmail(email);

            rateLimiter.resetLimit(email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("email", userDetails.getUsername());
            response.put("id", teacher.getId());
            response.put("name", teacher.getName());
            response.put("department", teacher.getDepartment() != null ? teacher.getDepartment() : "");
            response.put("role", "TEACHER");

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
    @GetMapping("/dashboard/stats/{teacherId}")
    public ResponseEntity<?> getDashboardStats(@PathVariable Long teacherId) {
        return ResponseEntity.ok(teacherService.getDashboardStats(teacherId));
    }

    // ===============================
    // 🎓 Students
    // ===============================
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<Student> students = teacherService.getAllStudentsPaginated(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", students.getContent());
        response.put("currentPage", students.getNumber());
        response.put("totalItems", students.getTotalElements());
        response.put("totalPages", students.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/students/all")
    public ResponseEntity<?> getAllStudentsList() {
        return ResponseEntity.ok(teacherService.getAllStudents());
    }

    @GetMapping("/students/roll/{rollNo}")
    public ResponseEntity<?> getStudentByRollNo(@PathVariable String rollNo) {
        return ResponseEntity.ok(teacherService.getStudentByRollNo(rollNo));
    }

    // ===============================
    // 📋 CSV IMPORT
    // ===============================
    @PostMapping("/attendance/import")
    public ResponseEntity<?> importAttendanceFromCSV(
            @RequestParam("file") MultipartFile file,
            @RequestParam("teacherId") Long teacherId
    ) {
        AttendanceImportResult result = teacherService.importAttendanceFromCSV(file, teacherId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Import completed");
        response.put("totalRecords", result.getTotalRecords());
        response.put("successCount", result.getSuccessCount());
        response.put("failedCount", result.getFailedCount());
        response.put("skippedCount", result.getSkippedCount());
        response.put("errors", result.getErrors());
        response.put("warnings", result.getWarnings());

        return ResponseEntity.ok(response);
    }

    // ===============================
    // 📋 Attendance - Single Entry
    // ===============================
    @PostMapping("/attendance")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> data) {
        Long teacherId = Long.valueOf(data.get("teacherId").toString());
        Long studentId = Long.valueOf(data.get("studentId").toString());
        LocalDate date = LocalDate.parse(data.get("date").toString());
        String subject = data.get("subject").toString();
        Boolean isPresent = Boolean.valueOf(data.get("isPresent").toString());
        String remarks = data.get("remarks") != null ? data.get("remarks").toString() : "";

        Attendance attendance = teacherService.markAttendance(
                teacherId, studentId, date, subject, isPresent, remarks
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Attendance marked successfully",
                "attendance", attendance
        ));
    }

    // ===============================
    // 📋 Attendance - Batch Entry
    // ===============================
    @PostMapping("/attendance/batch")
    public ResponseEntity<?> markBatchAttendance(@RequestBody Map<String, Object> data) {
        Long teacherId = Long.valueOf(data.get("teacherId").toString());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> attendanceList = (List<Map<String, Object>>) data.get("attendance");

        List<Attendance> saved = teacherService.markBatchAttendance(teacherId, attendanceList);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Attendance marked for " + saved.size() + " students",
                "count", saved.size()
        ));
    }

    // ===============================
    // 📋 Attendance - Get Records
    // ===============================
    @GetMapping("/attendance/teacher/{teacherId}")
    public ResponseEntity<?> getAttendanceByTeacher(
            @PathVariable Long teacherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Page<Attendance> attendance = teacherService.getAttendanceByTeacherPaginated(teacherId, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", attendance.getContent());
        response.put("currentPage", attendance.getNumber());
        response.put("totalItems", attendance.getTotalElements());
        response.put("totalPages", attendance.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/attendance/summary/{teacherId}")
    public ResponseEntity<?> getAttendanceSummary(@PathVariable Long teacherId) {
        return ResponseEntity.ok(teacherService.getAttendanceSummary(teacherId));
    }

    @GetMapping("/attendance/student/{studentId}")
    public ResponseEntity<?> getAttendanceByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(teacherService.getAttendanceByStudent(studentId));
    }

    @PutMapping("/attendance/{id}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Long id,
            @RequestBody Map<String, Object> data
    ) {
        Boolean isPresent = Boolean.valueOf(data.get("isPresent").toString());
        String remarks = data.get("remarks") != null ? data.get("remarks").toString() : "";

        Attendance attendance = teacherService.updateAttendance(id, isPresent, remarks);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Attendance updated successfully",
                "attendance", attendance
        ));
    }

    @DeleteMapping("/attendance/{id}")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        teacherService.deleteAttendance(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Attendance deleted successfully"
        ));
    }

    // ===============================
    // 📝 Marks
    // ===============================
    @PostMapping("/marks")
    public ResponseEntity<?> addMarks(@RequestBody Map<String, Object> data) {
        Long teacherId = Long.valueOf(data.get("teacherId").toString());
        Long studentId = Long.valueOf(data.get("studentId").toString());
        String subject = data.get("subject").toString();
        String examType = data.get("examType").toString();
        Double marksObtained = Double.valueOf(data.get("marksObtained").toString());
        Double totalMarks = Double.valueOf(data.get("totalMarks").toString());
        Integer semester = Integer.valueOf(data.get("semester").toString());
        String remarks = data.get("remarks") != null ? data.get("remarks").toString() : "";

        Marks marks = teacherService.addMarks(
                teacherId, studentId, subject, examType,
                marksObtained, totalMarks, semester, remarks
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Marks added successfully",
                "marks", marks
        ));
    }

    @PutMapping("/marks/{id}")
    public ResponseEntity<?> updateMarks(
            @PathVariable Long id,
            @RequestBody Map<String, Object> data
    ) {
        Double marksObtained = Double.valueOf(data.get("marksObtained").toString());
        String remarks = data.get("remarks") != null ? data.get("remarks").toString() : "";

        Marks marks = teacherService.updateMarks(id, marksObtained, remarks);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Marks updated successfully",
                "marks", marks
        ));
    }

    @GetMapping("/marks/teacher/{teacherId}")
    public ResponseEntity<?> getMarksByTeacher(
            @PathVariable Long teacherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Page<Marks> marks = teacherService.getMarksByTeacherPaginated(teacherId, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", marks.getContent());
        response.put("currentPage", marks.getNumber());
        response.put("totalItems", marks.getTotalElements());
        response.put("totalPages", marks.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/marks/student/{studentId}")
    public ResponseEntity<?> getMarksByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(teacherService.getMarksByStudent(studentId));
    }

    @GetMapping("/marks")
    public ResponseEntity<?> getAllMarks() {
        return ResponseEntity.ok(teacherService.getAllMarks());
    }

    // ===============================
    // 👤 PROFILE ENDPOINTS
    // ===============================
    @GetMapping("/profile/{teacherId}")
    public ResponseEntity<?> getProfile(@PathVariable Long teacherId) {
        Teacher teacher = teacherService.getProfile(teacherId);
        return ResponseEntity.ok(teacher);
    }

    @PutMapping("/profile/{teacherId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long teacherId,
            @RequestBody Map<String, Object> profileData
    ) {
        try {
            Teacher updated = teacherService.updateProfile(teacherId, profileData);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "teacher", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/profile/{teacherId}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long teacherId,
            @RequestBody Map<String, String> passwordData
    ) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            teacherService.changePassword(teacherId, currentPassword, newPassword);

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
    // 📚 STUDY MATERIAL ENDPOINTS
    // ===============================
    @PostMapping("/materials/upload")
    public ResponseEntity<?> uploadMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam("teacherId") Long teacherId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("subject") String subject,
            @RequestParam(value = "semester", required = false) Integer semester,
            @RequestParam(value = "category", required = false) String category
    ) {
        try {
            StudyMaterial material = studyMaterialService.uploadMaterial(
                    teacherId, file, title, description, subject, semester, category
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Material uploaded successfully",
                    "material", material
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/materials/teacher/{teacherId}")
    public ResponseEntity<?> getMaterialsByTeacher(
            @PathVariable Long teacherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<StudyMaterial> materials = studyMaterialService.getMaterialsByTeacherPaginated(teacherId, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", materials.getContent());
        response.put("currentPage", materials.getNumber());
        response.put("totalItems", materials.getTotalElements());
        response.put("totalPages", materials.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/materials/{materialId}")
    public ResponseEntity<?> getMaterialById(@PathVariable Long materialId) {
        StudyMaterial material = studyMaterialService.getMaterialById(materialId);
        return ResponseEntity.ok(material);
    }

    // ✅ FIXED DOWNLOAD ENDPOINT
    @GetMapping("/materials/{materialId}/download")
    public ResponseEntity<Resource> downloadMaterial(@PathVariable Long materialId) {
        try {
            StudyMaterial material = studyMaterialService.getMaterialById(materialId);
            Resource resource = studyMaterialService.downloadMaterial(materialId);

            // ✅ Get proper MIME type
            String contentType = getContentType(material.getFileType());

            // ✅ Encode filename for special characters
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

    @PutMapping("/materials/{materialId}")
    public ResponseEntity<?> updateMaterial(
            @PathVariable Long materialId,
            @RequestBody Map<String, Object> data
    ) {
        try {
            String title = (String) data.get("title");
            String description = (String) data.get("description");
            String subject = (String) data.get("subject");
            Integer semester = data.get("semester") != null ? Integer.valueOf(data.get("semester").toString()) : null;
            String category = (String) data.get("category");

            StudyMaterial updated = studyMaterialService.updateMaterial(
                    materialId, title, description, subject, semester, category
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Material updated successfully",
                    "material", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/materials/{materialId}")
    public ResponseEntity<?> deleteMaterial(
            @PathVariable Long materialId,
            @RequestParam Long teacherId
    ) {
        try {
            studyMaterialService.deleteMaterial(materialId, teacherId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Material deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/materials/stats/{teacherId}")
    public ResponseEntity<?> getMaterialStats(@PathVariable Long teacherId) {
        Map<String, Object> stats = studyMaterialService.getMaterialStats(teacherId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/materials/subjects/{teacherId}")
    public ResponseEntity<?> getSubjectsByTeacher(@PathVariable Long teacherId) {
        List<String> subjects = studyMaterialService.getSubjectsByTeacher(teacherId);
        return ResponseEntity.ok(subjects);
    }

    // ✅ Helper method to get proper MIME types
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