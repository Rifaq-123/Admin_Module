package com.jvlcode.spring_boot_demo.controllers;

import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.security.JwtUtil;
import com.jvlcode.spring_boot_demo.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private AdminService adminService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authManager;


    // ===============================
    // 🔐 Admin Login
    // ===============================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        String username = creds.get("username");
        String password = creds.get("password");

        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, password)
        );

        String token = jwtUtil.generateToken(
                org.springframework.security.core.userdetails.User
                        .withUsername(username)
                        .password(password)
                        .authorities("ADMIN")
                        .build()
        );
        
        return ResponseEntity.ok(Map.of(
            "token", token,
            "username", username
        ));
    }

 // ===============================
 // 🎓 Student CRUD
 // ===============================

 @GetMapping("/students")
 public ResponseEntity<?> getAllStudents() {
     return ResponseEntity.ok(adminService.getAllStudents());
 }

 @GetMapping("/students/{id}")
 public ResponseEntity<?> getStudentById(@PathVariable Long id) {
     Student student = adminService.getStudentById(id);
     if (student == null)
         return ResponseEntity.status(404).body(Map.of("message", "Student not found"));
     return ResponseEntity.ok(student);
 }

 @PostMapping("/students")
 public ResponseEntity<?> addStudent(@RequestBody Student student) {
     try {
         return ResponseEntity.ok(adminService.addStudent(student));
     } catch (DataIntegrityViolationException e) {
         return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
     }
 }
 @PutMapping("/students/{id}")
 public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student student) {
     Student updated = adminService.updateStudent(id, student);
     if (updated == null)
         return ResponseEntity.status(404).body(Map.of("message", "Student not found"));
     return ResponseEntity.ok(updated);
 }

 @DeleteMapping("/students/{id}")
 public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
     boolean deleted = adminService.deleteStudent(id);
     if (!deleted)
         return ResponseEntity.status(404).body(Map.of("message", "Student not found"));
     return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
 }

}
