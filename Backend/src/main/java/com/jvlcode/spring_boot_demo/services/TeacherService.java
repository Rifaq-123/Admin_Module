package com.jvlcode.spring_boot_demo.services;

import com.jvlcode.spring_boot_demo.dto.AttendanceImportDTO;
import com.jvlcode.spring_boot_demo.dto.AttendanceImportResult;
import com.jvlcode.spring_boot_demo.entity.Attendance;
import com.jvlcode.spring_boot_demo.entity.Marks;
import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.exception.DuplicateAttendanceException;
import com.jvlcode.spring_boot_demo.exception.StudentNotFoundException;
import com.jvlcode.spring_boot_demo.exception.TeacherNotFoundException;
import com.jvlcode.spring_boot_demo.repository.AttendanceRepository;
import com.jvlcode.spring_boot_demo.repository.MarksRepository;
import com.jvlcode.spring_boot_demo.repository.StudentRepository;
import com.jvlcode.spring_boot_demo.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private CsvParserService csvParserService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // ===============================
    // 👤 Teacher Profile
    // ===============================

    @Transactional(readOnly = true)
    public Teacher getTeacherByEmail(String email) {
        return teacherRepository.findByEmail(email)
                .orElseThrow(() -> new TeacherNotFoundException("Teacher not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public Teacher getTeacherById(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new TeacherNotFoundException(id));
    }

    // ===============================
    // 📊 Dashboard Stats (FIXED)
    // ===============================

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats(Long teacherId) {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Verify teacher exists
            if (!teacherRepository.existsById(teacherId)) {
                throw new TeacherNotFoundException(teacherId);
            }

            long totalStudents = studentRepository.count();
            long totalAttendanceRecords = attendanceRepository.countByTeacherId(teacherId);
            long totalMarksRecords = marksRepository.countByTeacherId(teacherId);

            // Get attendance records for calculations
            List<Attendance> teacherAttendance = attendanceRepository.findByTeacherId(teacherId);

            // Calculate unique dates
            long uniqueDays = teacherAttendance.stream()
                    .map(Attendance::getDate)
                    .distinct()
                    .count();

            // Calculate present/absent
            long presentCount = teacherAttendance.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getIsPresent()))
                    .count();
            long absentCount = teacherAttendance.size() - presentCount;

            stats.put("totalStudents", totalStudents);
            stats.put("totalAttendanceRecords", totalAttendanceRecords);
            stats.put("totalMarksRecords", totalMarksRecords);
            stats.put("uniqueDaysMarked", uniqueDays);
            stats.put("presentCount", presentCount);
            stats.put("absentCount", absentCount);

        } catch (TeacherNotFoundException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            // Return default values on error
            stats.put("totalStudents", 0L);
            stats.put("totalAttendanceRecords", 0L);
            stats.put("totalMarksRecords", 0L);
            stats.put("uniqueDaysMarked", 0L);
            stats.put("presentCount", 0L);
            stats.put("absentCount", 0L);
        }

        return stats;
    }

    // ===============================
    // 🎓 Students
    // ===============================

    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Transactional(readOnly = true)
    public Page<Student> getAllStudentsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return studentRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Student getStudentByRollNo(String rollNo) {
        return studentRepository.findByRollNo(rollNo)
                .orElseThrow(() -> new StudentNotFoundException("rollNo", rollNo));
    }

    // ===============================
    // 📋 ATTENDANCE - Single Entry
    // ===============================

    @Transactional
    public Attendance markAttendance(Long teacherId, Long studentId, LocalDate date,
                                     String subject, Boolean isPresent, String remarks) {

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new TeacherNotFoundException(teacherId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(studentId));

        // Check for duplicate
        Optional<Attendance> existing = attendanceRepository
                .findByStudentIdAndDateAndSubject(studentId, date, subject);

        if (existing.isPresent()) {
            throw new DuplicateAttendanceException(
                    student.getRollNo(), date.toString(), subject);
        }

        Attendance attendance = new Attendance();
        attendance.setTeacher(teacher);
        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setSubject(subject);
        attendance.setIsPresent(isPresent);
        attendance.setRemarks(remarks != null ? remarks : "");

        return attendanceRepository.save(attendance);
    }

    // ===============================
    // 📋 ATTENDANCE - Batch Entry
    // ===============================

    @Transactional
    public List<Attendance> markBatchAttendance(Long teacherId, List<Map<String, Object>> attendanceList) {

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new TeacherNotFoundException(teacherId));

        List<Attendance> savedAttendance = new ArrayList<>();

        for (Map<String, Object> data : attendanceList) {
            try {
                Long studentId = Long.valueOf(data.get("studentId").toString());
                LocalDate date = LocalDate.parse(data.get("date").toString());
                String subject = data.get("subject").toString();
                Boolean isPresent = Boolean.valueOf(data.get("isPresent").toString());
                String remarks = data.get("remarks") != null ? data.get("remarks").toString() : "";

                Student student = studentRepository.findById(studentId).orElse(null);
                if (student == null) continue;

                // Skip if already exists
                if (attendanceRepository.findByStudentIdAndDateAndSubject(studentId, date, subject).isPresent()) {
                    continue;
                }

                Attendance attendance = new Attendance();
                attendance.setTeacher(teacher);
                attendance.setStudent(student);
                attendance.setDate(date);
                attendance.setSubject(subject);
                attendance.setIsPresent(isPresent);
                attendance.setRemarks(remarks);

                savedAttendance.add(attendance);
            } catch (Exception e) {
                // Skip invalid entries
                System.err.println("Error processing attendance entry: " + e.getMessage());
            }
        }

        if (!savedAttendance.isEmpty()) {
            return attendanceRepository.saveAll(savedAttendance);
        }
        
        return savedAttendance;
    }

    // ===============================
    // 📋 CSV IMPORT (FIXED)
    // ===============================

    @Transactional
    public AttendanceImportResult importAttendanceFromCSV(MultipartFile file, Long teacherId) {

        // Validate file
        csvParserService.validateCSVFile(file);

        // Get teacher
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new TeacherNotFoundException(teacherId));

        // Parse CSV
        List<AttendanceImportDTO> dtoList = csvParserService.parseAttendanceCSV(file);

        if (dtoList.isEmpty()) {
            throw new RuntimeException("CSV file is empty or has no valid data");
        }

        // Prepare result
        AttendanceImportResult result = new AttendanceImportResult();
        result.setTotalRecords(dtoList.size());

        // Load all students once (optimization)
        List<Student> allStudents = studentRepository.findAll();
        Map<String, Student> studentMap = allStudents.stream()
                .collect(Collectors.toMap(
                        s -> s.getRollNo().toUpperCase(),
                        s -> s,
                        (existing, replacement) -> existing // Handle duplicates
                ));

        List<Attendance> attendanceToSave = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int failedCount = 0;
        int skippedCount = 0;
        
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 0; i < dtoList.size(); i++) {
            AttendanceImportDTO dto = dtoList.get(i);
            int rowNumber = i + 2; // +1 for 0-index, +1 for header

            try {
                // Validate DTO
                if (!dto.isValid()) {
                    errors.add("Row " + rowNumber + ": " + dto.getValidationError());
                    failedCount++;
                    continue;
                }

                // Find student
                Student student = studentMap.get(dto.getRollNo().trim().toUpperCase());
                if (student == null) {
                    errors.add("Row " + rowNumber + ": Student not found with roll number: " + dto.getRollNo());
                    failedCount++;
                    continue;
                }

                // Parse date
                LocalDate date;
                try {
                    date = LocalDate.parse(dto.getDate().trim(), dateFormatter);
                } catch (DateTimeParseException e) {
                    errors.add("Row " + rowNumber + ": Invalid date format '" + dto.getDate() + "'. Use YYYY-MM-DD");
                    failedCount++;
                    continue;
                }

                // Validate date not in future
                if (date.isAfter(LocalDate.now())) {
                    errors.add("Row " + rowNumber + ": Date cannot be in the future");
                    failedCount++;
                    continue;
                }

                // Check for duplicate
                Optional<Attendance> existing = attendanceRepository
                        .findByStudentIdAndDateAndSubject(student.getId(), date, dto.getSubject().trim());

                if (existing.isPresent()) {
                    skippedCount++;
                    continue;
                }

                // Create attendance
                Attendance attendance = new Attendance();
                attendance.setTeacher(teacher);
                attendance.setStudent(student);
                attendance.setDate(date);
                attendance.setSubject(dto.getSubject().trim());
                attendance.setIsPresent(dto.getStatus().trim().equalsIgnoreCase("P"));
                attendance.setRemarks(dto.getRemarks() != null ? dto.getRemarks().trim() : "");

                attendanceToSave.add(attendance);
                successCount++;

            } catch (Exception e) {
                errors.add("Row " + rowNumber + ": " + e.getMessage());
                failedCount++;
            }
        }

        // Batch save
        if (!attendanceToSave.isEmpty()) {
            attendanceRepository.saveAll(attendanceToSave);
        }

        result.setSuccessCount(successCount);
        result.setFailedCount(failedCount);
        result.setSkippedCount(skippedCount);
        
        // Limit errors to first 50
        if (errors.size() > 50) {
            errors = new ArrayList<>(errors.subList(0, 50));
            errors.add("... and more errors");
        }
        result.setErrors(errors);

        return result;
    }

    // ===============================
    // 📋 ATTENDANCE - Get Records
    // ===============================

    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByTeacher(Long teacherId) {
        return attendanceRepository.findByTeacherIdOptimized(teacherId);
    }

    @Transactional(readOnly = true)
    public Page<Attendance> getAttendanceByTeacherPaginated(Long teacherId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        return attendanceRepository.findByTeacherIdPaginated(teacherId, pageable);
    }

    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentIdOptimized(studentId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceSummary(Long teacherId) {
        List<Attendance> attendance = attendanceRepository.findByTeacherId(teacherId);

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

        long uniqueDates = attendance.stream()
                .map(Attendance::getDate)
                .distinct()
                .count();
        summary.put("uniqueDates", uniqueDates);

        List<String> uniqueSubjects = attendance.stream()
                .map(Attendance::getSubject)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        summary.put("subjects", uniqueSubjects);

        return summary;
    }

    @Transactional
    public Attendance updateAttendance(Long id, Boolean isPresent, String remarks) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found with ID: " + id));

        attendance.setIsPresent(isPresent);
        attendance.setRemarks(remarks);

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public boolean deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            return false;
        }
        attendanceRepository.deleteById(id);
        return true;
    }

    // ===============================
    // 📝 MARKS Management
    // ===============================

    @Transactional
    public Marks addMarks(Long teacherId, Long studentId, String subject,
                          String examType, Double marksObtained, Double totalMarks,
                          Integer semester, String remarks) {

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new TeacherNotFoundException(teacherId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(studentId));

        // Validate marks
        if (marksObtained > totalMarks) {
            throw new RuntimeException("Marks obtained cannot exceed total marks");
        }

        Marks marks = new Marks();
        marks.setTeacher(teacher);
        marks.setStudent(student);
        marks.setSubject(subject);
        marks.setExamType(examType);
        marks.setMarksObtained(marksObtained);
        marks.setTotalMarks(totalMarks);
        marks.setSemester(semester);
        marks.setRemarks(remarks != null ? remarks : "");

        return marksRepository.save(marks);
    }

    @Transactional
    public Marks updateMarks(Long marksId, Double marksObtained, String remarks) {
        Marks marks = marksRepository.findById(marksId)
                .orElseThrow(() -> new RuntimeException("Marks record not found with ID: " + marksId));

        if (marksObtained > marks.getTotalMarks()) {
            throw new RuntimeException("Marks obtained cannot exceed total marks");
        }

        marks.setMarksObtained(marksObtained);
        marks.setRemarks(remarks);

        return marksRepository.save(marks);
    }

    @Transactional(readOnly = true)
    public List<Marks> getMarksByTeacher(Long teacherId) {
        return marksRepository.findByTeacherIdOptimized(teacherId);
    }

    @Transactional(readOnly = true)
    public Page<Marks> getMarksByTeacherPaginated(Long teacherId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return marksRepository.findByTeacherIdPaginated(teacherId, pageable);
    }

    @Transactional(readOnly = true)
    public List<Marks> getMarksByStudent(Long studentId) {
        return marksRepository.findByStudentIdOptimized(studentId);
    }

    @Transactional(readOnly = true)
    public List<Marks> getAllMarks() {
        return marksRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }
    
 // Add to services/TeacherService.java

 // ===============================
 // 👤 PROFILE MANAGEMENT
 // ===============================

 @Transactional(readOnly = true)
 public Teacher getProfile(Long teacherId) {
     return teacherRepository.findById(teacherId)
             .orElseThrow(() -> new TeacherNotFoundException(teacherId));
 }

 @Transactional
 public Teacher updateProfile(Long teacherId, Map<String, Object> profileData) {
     Teacher teacher = teacherRepository.findById(teacherId)
             .orElseThrow(() -> new TeacherNotFoundException(teacherId));

     // Update allowed fields
     if (profileData.containsKey("name")) {
         teacher.setName((String) profileData.get("name"));
     }
     if (profileData.containsKey("phone")) {
         teacher.setPhone((String) profileData.get("phone"));
     }
     if (profileData.containsKey("department")) {
         teacher.setDepartment((String) profileData.get("department"));
     }
     if (profileData.containsKey("subject")) {
         teacher.setSubject((String) profileData.get("subject"));
     }
     if (profileData.containsKey("specialization")) {
         teacher.setSpecialization((String) profileData.get("specialization"));
     }
     if (profileData.containsKey("qualification")) {
         teacher.setQualification((String) profileData.get("qualification"));
     }
     if (profileData.containsKey("experience")) {
         Object exp = profileData.get("experience");
         if (exp != null) {
             teacher.setExperience(Integer.valueOf(exp.toString()));
         }
     }
     if (profileData.containsKey("address")) {
         teacher.setAddress((String) profileData.get("address"));
     }
     if (profileData.containsKey("city")) {
         teacher.setCity((String) profileData.get("city"));
     }
     if (profileData.containsKey("state")) {
         teacher.setState((String) profileData.get("state"));
     }
     if (profileData.containsKey("country")) {
         teacher.setCountry((String) profileData.get("country"));
     }

     return teacherRepository.save(teacher);
 }

 @Transactional
 public boolean changePassword(Long teacherId, String currentPassword, String newPassword) {
     Teacher teacher = teacherRepository.findById(teacherId)
             .orElseThrow(() -> new TeacherNotFoundException(teacherId));

     // Verify current password
     if (!passwordEncoder.matches(currentPassword, teacher.getPassword())) {
         throw new RuntimeException("Current password is incorrect");
     }

     // Validate new password
     if (newPassword == null || newPassword.length() < 6) {
         throw new RuntimeException("New password must be at least 6 characters");
     }

     // Update password
     teacher.setPassword(passwordEncoder.encode(newPassword));
     teacherRepository.save(teacher);

     return true;
 }
}