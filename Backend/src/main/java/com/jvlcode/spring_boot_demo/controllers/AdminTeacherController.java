package com.jvlcode.spring_boot_demo.controllers;

import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.services.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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
    public ResponseEntity<?> getAllTeachers(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        // Paginated if params provided
        if (page != null && size != null) {
            Page<Teacher> teachers = adminService.getAllTeachersPaginated(page, size, sortBy, sortDir);

            Map<String, Object> response = new HashMap<>();
            response.put("content", teachers.getContent());
            response.put("currentPage", teachers.getNumber());
            response.put("totalItems", teachers.getTotalElements());
            response.put("totalPages", teachers.getTotalPages());
            response.put("hasNext", teachers.hasNext());
            response.put("hasPrevious", teachers.hasPrevious());

            return ResponseEntity.ok(response);
        }

        // Simple list otherwise
        return ResponseEntity.ok(adminService.getAllTeachers());
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllTeachersList() {
        return ResponseEntity.ok(adminService.getAllTeachers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTeacherById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getTeacherById(id));
    }

    @PostMapping
    public ResponseEntity<?> addTeacher(@Valid @RequestBody Teacher teacher) {
        Teacher saved = adminService.addTeacher(teacher);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Teacher added successfully",
                "teacher", saved
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(
            @PathVariable Long id,
            @Valid @RequestBody Teacher teacher
    ) {
        Teacher updated = adminService.updateTeacher(id, teacher);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Teacher updated successfully",
                "teacher", updated
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        adminService.deleteTeacher(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Teacher deleted successfully"
        ));
    }
}