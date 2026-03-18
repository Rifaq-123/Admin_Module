package com.jvlcode.spring_boot_demo.controllers;

import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.exception.RateLimitExceededException;
import com.jvlcode.spring_boot_demo.security.JwtUtil;
import com.jvlcode.spring_boot_demo.security.RateLimiterService;
import com.jvlcode.spring_boot_demo.services.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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

    @Autowired
    private RateLimiterService rateLimiter;

    // ===============================
    // 🔐 Admin Login
    // ===============================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        String username = creds.get("username");

        // Rate limiting check
        if (!rateLimiter.isAllowed(username)) {
            long seconds = rateLimiter.getSecondsUntilReset(username);
            throw new RateLimitExceededException(
                    "Too many login attempts. Try again in " + seconds + " seconds.");
        }

        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            username,
                            creds.get("password")
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            // Reset rate limit on success
            rateLimiter.resetLimit(username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("username", userDetails.getUsername());
            response.put("role", "ROLE_ADMIN");

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid username or password",
                    "remainingAttempts", rateLimiter.getRemainingAttempts(username)
            ));
        }
    }

    // ===============================
    // 📊 Dashboard Stats
    // ===============================
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ===============================
    // 🎓 Student CRUD (Paginated)
    // ===============================

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search
    ) {
        Page<Student> students;

        if (search != null && !search.isBlank()) {
            students = adminService.searchStudents(search, page, size);
        } else {
            students = adminService.getAllStudentsPaginated(page, size, sortBy, sortDir);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", students.getContent());
        response.put("currentPage", students.getNumber());
        response.put("totalItems", students.getTotalElements());
        response.put("totalPages", students.getTotalPages());
        response.put("hasNext", students.hasNext());
        response.put("hasPrevious", students.hasPrevious());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/students/all")
    public ResponseEntity<?> getAllStudentsList() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getStudentById(id));
    }

    @GetMapping("/students/roll/{rollNo}")
    public ResponseEntity<?> getStudentByRollNo(@PathVariable String rollNo) {
        return ResponseEntity.ok(adminService.getStudentByRollNo(rollNo));
    }

    @PostMapping("/students")
    public ResponseEntity<?> addStudent(@Valid @RequestBody Student student) {
        Student saved = adminService.addStudent(student);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student added successfully",
                "student", saved
        ));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody Student student
    ) {
        Student updated = adminService.updateStudent(id, student);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student updated successfully",
                "student", updated
        ));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        adminService.deleteStudent(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student deleted successfully"
        ));
    }
}