package com.jvlcode.spring_boot_demo.controllers;

import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/teachers")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminTeacherController {

    @Autowired
    private AdminService adminService;

    // ✅ Get all teachers
    @GetMapping
    public List<Teacher> getAllTeachers() {
        return adminService.getAllTeachers();
    }

    // ✅ Get teacher by ID
    @GetMapping("/{id}")
    public Teacher getTeacherById(@PathVariable Long id) {
        return adminService.getTeacherById(id);
    }

    // ✅ Add new teacher
    @PostMapping
    public ResponseEntity<Teacher> addTeacher(@RequestBody Teacher teacher) {
        System.out.println("🟢 Received teacher: " + teacher);
        Teacher saved = adminService.addTeacher(teacher);
        System.out.println("✅ Saved teacher: " + saved);
        return ResponseEntity.ok(saved);
    }

    // ✅ Update teacher by ID
    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacher) {
        return ResponseEntity.ok(adminService.updateTeacher(id, teacher));
    }

    // ✅ Delete teacher by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteTeacher(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteTeacher(id));
    }
}
