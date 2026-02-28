package com.jvlcode.spring_boot_demo.controllers;

import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/admin/teachers")
public class AdminTeacherController {

    @Autowired
    private AdminService adminService;

    // ===============================
    // 👩‍🏫 Get All Teachers
    // ===============================
    @GetMapping
    public ResponseEntity<?> getAllTeachers() {
        return ResponseEntity.ok(adminService.getAllTeachers());
    }

    // ===============================
    // 👩‍🏫 Get Teacher By ID
    // ===============================
    @GetMapping("/{id}")
    public ResponseEntity<?> getTeacherById(@PathVariable Long id) {

        Teacher teacher = adminService.getTeacherById(id);

        if (teacher == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Teacher not found"));
        }

        return ResponseEntity.ok(teacher);
    }

    // ===============================
    // 👩‍🏫 Add Teacher
    // ===============================
    @PostMapping
    public ResponseEntity<?> addTeacher(@RequestBody Teacher teacher) {

        try {
            Teacher saved = adminService.addTeacher(teacher);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();   // 👈 VERY IMPORTANT
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
    // ===============================
    // 👩‍🏫 Update Teacher
    // ===============================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(
            @PathVariable Long id,
            @RequestBody Teacher teacher
    ) {

        Teacher updated = adminService.updateTeacher(id, teacher);

        if (updated == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Teacher not found"));
        }

        return ResponseEntity.ok(updated);
    }

    // ===============================
    // 👩‍🏫 Delete Teacher
    // ===============================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {

        boolean deleted = adminService.deleteTeacher(id);

        if (!deleted) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Teacher not found"));
        }

        return ResponseEntity.ok(
                Map.of("message", "Teacher deleted successfully")
        );
    }
}