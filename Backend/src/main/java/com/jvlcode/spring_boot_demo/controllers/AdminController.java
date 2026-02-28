package com.jvlcode.spring_boot_demo.controllers;

import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.security.JwtUtil;
import com.jvlcode.spring_boot_demo.services.AdminService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authManager;

    // ===============================
    // 🔐 Admin Login
    // ===============================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {

        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            creds.get("username"),
                            creds.get("password")
                    )
            );

            UserDetails userDetails =
                    (UserDetails) authentication.getPrincipal();

            String token = jwtUtil.generateToken(userDetails);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", userDetails.getUsername()
            ));

        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("message", "Invalid username or password"));
        }
    }

    // ===============================
    // 🎓 Student CRUD
    // ===============================

    // ✅ GET ALL
    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    // ✅ GET BY ROLL NO (FIXED PATH)
    @GetMapping("/students/roll/{rollNo}")
    public ResponseEntity<?> getStudentByRollNo(@PathVariable String rollNo) {

        Student student = adminService.getStudentByRollNo(rollNo);

        if (student == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Student not found"));
        }

        return ResponseEntity.ok(student);
    }

    // ✅ ADD STUDENT
    @PostMapping("/students")
    public ResponseEntity<?> addStudent(@RequestBody Student student) {

        try {
            return ResponseEntity.ok(adminService.addStudent(student));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already exists"));
        }
    }

    // ✅ UPDATE STUDENT
    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(
            @PathVariable Long id,
            @RequestBody Student student
    ) {

        Student updated = adminService.updateStudent(id, student);

        if (updated == null)
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Student not found"));

        return ResponseEntity.ok(updated);
    }

    // ✅ DELETE STUDENT
    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {

        boolean deleted = adminService.deleteStudent(id);

        if (!deleted)
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Student not found"));

        return ResponseEntity.ok(
                Map.of("message", "Student deleted successfully")
        );
    }
}