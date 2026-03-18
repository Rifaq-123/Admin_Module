package com.jvlcode.spring_boot_demo.controllers;

import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/setup")
public class SetupController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authManager;

    /**
     * Create student with custom credentials
     */
    @PostMapping("/create-student")
    public ResponseEntity<?> createStudent(@RequestBody Map<String, String> data) {
        try {
            String email = data.get("email");
            String password = data.get("password");
            String name = data.getOrDefault("name", "Student");

            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email is required"
                ));
            }

            if (password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Password is required"
                ));
            }

            // Check if student already exists - update password
            if (studentRepository.findByEmail(email.trim().toLowerCase()).isPresent()) {
                Student existing = studentRepository.findByEmail(email.trim().toLowerCase()).get();
                existing.setPassword(passwordEncoder.encode(password));
                studentRepository.save(existing);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Student already exists - password updated",
                    "id", existing.getId(),
                    "email", email,
                    "password", password,
                    "rollNo", existing.getRollNo()
                ));
            }

            // Generate roll number
            String rollNo = generateRollNo();

            // Create new student
            Student student = new Student();
            student.setRollNo(rollNo);
            student.setName(name);
            student.setEmail(email.trim().toLowerCase());
            student.setPassword(passwordEncoder.encode(password));
            student.setDepartment(data.getOrDefault("department", "Computer Science"));
            student.setCourse(data.getOrDefault("course", "B.Tech"));
            student.setDateOfJoining(LocalDate.now());
            student.setEndDate(LocalDate.now().plusYears(4));

            Student saved = studentRepository.save(student);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student created successfully",
                "id", saved.getId(),
                "email", saved.getEmail(),
                "password", password,
                "rollNo", saved.getRollNo()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    /**
     * Verify student exists
     */
    @PostMapping("/verify-student")
    public ResponseEntity<?> verifyStudent(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");

        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Email is required"
            ));
        }

        return studentRepository.findByEmail(email.trim().toLowerCase())
            .map(student -> {
                boolean matches = password != null && 
                    passwordEncoder.matches(password, student.getPassword());
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "exists", true,
                    "email", student.getEmail(),
                    "name", student.getName(),
                    "rollNo", student.getRollNo(),
                    "department", student.getDepartment() != null ? student.getDepartment() : "",
                    "passwordMatches", matches,
                    "passwordHashPreview", student.getPassword().substring(0, 10) + "..."
                ));
            })
            .orElse(ResponseEntity.ok(Map.of(
                "success", false,
                "exists", false,
                "message", "Student not found"
            )));
    }

    /**
     * TEST AUTHENTICATION - Debug endpoint
     */
    @PostMapping("/test-auth")
    public ResponseEntity<?> testAuth(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");
        
        System.out.println("\n========================================");
        System.out.println("🧪 TEST-AUTH: Testing authentication");
        System.out.println("   Email: " + email);
        System.out.println("   Password: " + password);
        System.out.println("========================================\n");
        
        try {
            // Step 1: Find student
            var studentOpt = studentRepository.findByEmail(email.trim().toLowerCase());
            if (studentOpt.isEmpty()) {
                System.out.println("❌ Step 1 FAILED: Student not found");
                return ResponseEntity.ok(Map.of(
                    "step1_findStudent", "FAILED",
                    "message", "Student not found with email: " + email
                ));
            }
            
            Student student = studentOpt.get();
            System.out.println("✅ Step 1 PASSED: Student found - " + student.getEmail());
            
            // Step 2: Check password manually
            boolean passwordMatches = passwordEncoder.matches(password, student.getPassword());
            System.out.println("🔐 Step 2: Password matches = " + passwordMatches);
            
            if (!passwordMatches) {
                System.out.println("❌ Step 2 FAILED: Password doesn't match");
                return ResponseEntity.ok(Map.of(
                    "step1_findStudent", "PASSED",
                    "step2_passwordCheck", "FAILED",
                    "message", "Password doesn't match"
                ));
            }
            System.out.println("✅ Step 2 PASSED: Password matches");
            
            // Step 3: Try AuthenticationManager
            System.out.println("🔄 Step 3: Testing AuthenticationManager...");
            
            var auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(email.trim().toLowerCase(), password)
            );
            
            System.out.println("✅ Step 3 PASSED: Authentication successful!");
            System.out.println("   Principal: " + auth.getName());
            System.out.println("   Authorities: " + auth.getAuthorities());
            
            return ResponseEntity.ok(Map.of(
                "step1_findStudent", "PASSED",
                "step2_passwordCheck", "PASSED",
                "step3_authManager", "PASSED",
                "authenticated", true,
                "principal", auth.getName(),
                "authorities", auth.getAuthorities().toString(),
                "message", "All steps passed! Login should work."
            ));
            
        } catch (Exception e) {
            System.out.println("❌ ERROR: " + e.getClass().getSimpleName());
            System.out.println("   Message: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.ok(Map.of(
                "step3_authManager", "FAILED",
                "error", e.getClass().getSimpleName(),
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Reset password
     */
    @PostMapping("/reset-student-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String newPassword = data.get("newPassword");

        return studentRepository.findByEmail(email.trim().toLowerCase())
            .map(student -> {
                student.setPassword(passwordEncoder.encode(newPassword));
                studentRepository.save(student);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password reset successfully",
                    "email", email,
                    "newPassword", newPassword
                ));
            })
            .orElse(ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Student not found"
            )));
    }

    private String generateRollNo() {
        long count = studentRepository.count();
        return String.format("STU%03d", count + 1);
    }
    
    /**
     * Full diagnostic check
     */
    @GetMapping("/diagnose/{email}")
    public ResponseEntity<?> diagnose(@PathVariable String email) {
        System.out.println("\n🏥 DIAGNOSTIC for: " + email);
        
        String normalized = email.trim().toLowerCase();
        
        // Check direct query
        var byEmail = studentRepository.findByEmail(normalized);
        
        // Check all students
        var allStudents = studentRepository.findAll();
        var emails = allStudents.stream()
            .map(s -> Map.of(
                "id", s.getId(),
                "email", s.getEmail(),
                "emailLower", s.getEmail().toLowerCase(),
                "matches", s.getEmail().equalsIgnoreCase(normalized)
            ))
            .toList();
        
        return ResponseEntity.ok(Map.of(
            "searchEmail", email,
            "normalizedEmail", normalized,
            "foundByEmail", byEmail.isPresent(),
            "foundStudent", byEmail.map(s -> Map.of(
                "id", s.getId(),
                "email", s.getEmail(),
                "name", s.getName(),
                "passwordLength", s.getPassword().length()
            )).orElse(null),
            "totalStudents", allStudents.size(),
            "allStudentEmails", emails
        ));
    }
}