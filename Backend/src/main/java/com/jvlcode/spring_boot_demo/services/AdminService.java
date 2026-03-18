package com.jvlcode.spring_boot_demo.services;

import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.exception.DuplicateEmailException;
import com.jvlcode.spring_boot_demo.exception.StudentNotFoundException;
import com.jvlcode.spring_boot_demo.exception.TeacherNotFoundException;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ===============================
    // 📊 DASHBOARD STATS (FIXED)
    // ===============================

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Use JPA default count() method - works with any database
            long totalStudents = studentRepository.count();
            long totalTeachers = teacherRepository.count();
            
            stats.put("totalStudents", totalStudents);
            stats.put("totalTeachers", totalTeachers);
            stats.put("success", true);
            
        } catch (Exception e) {
            System.err.println("Error fetching dashboard stats: " + e.getMessage());
            e.printStackTrace();
            stats.put("totalStudents", 0);
            stats.put("totalTeachers", 0);
            stats.put("success", false);
            stats.put("error", e.getMessage());
        }
        
        return stats;
    }

    // ===============================
    // 🎓 STUDENT MANAGEMENT
    // ===============================

    @Transactional
    public Student addStudent(Student student) {
        // Check for duplicate email
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new DuplicateEmailException(student.getEmail(), "Student");
        }

        // Generate roll number
        Long lastId = studentRepository.findTopByOrderByIdDesc()
                .map(Student::getId)
                .orElse(0L);
        String rollNo = String.format("STU%03d", lastId + 1);
        student.setRollNo(rollNo);

        // Encode password
        student.setPassword(passwordEncoder.encode(student.getPassword()));

        return studentRepository.save(student);
    }

    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Transactional(readOnly = true)
    public Page<Student> getAllStudentsPaginated(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return studentRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Student> searchStudents(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return studentRepository.searchStudents(search, pageable);
    }

    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public Student getStudentByRollNo(String rollNo) {
        return studentRepository.findByRollNo(rollNo)
                .orElseThrow(() -> new StudentNotFoundException("rollNo", rollNo));
    }

    @Transactional
    public Student updateStudent(Long id, Student updatedStudent) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));

        // Check for duplicate email (excluding current student)
        if (studentRepository.existsByEmailAndIdNot(updatedStudent.getEmail(), id)) {
            throw new DuplicateEmailException(updatedStudent.getEmail(), "Student");
        }

        existing.setName(updatedStudent.getName());
        existing.setEmail(updatedStudent.getEmail());
        existing.setPhone(updatedStudent.getPhone());
        existing.setDepartment(updatedStudent.getDepartment());
        existing.setCourse(updatedStudent.getCourse());
        existing.setAddress(updatedStudent.getAddress());
        existing.setCity(updatedStudent.getCity());
        existing.setState(updatedStudent.getState());
        existing.setCountry(updatedStudent.getCountry());
        existing.setDateOfJoining(updatedStudent.getDateOfJoining());
        existing.setEndDate(updatedStudent.getEndDate());

        // Update password only if provided
        if (updatedStudent.getPassword() != null && !updatedStudent.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updatedStudent.getPassword()));
        }

        return studentRepository.save(existing);
    }

    @Transactional
    public boolean deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException(id);
        }
        studentRepository.deleteById(id);
        return true;
    }

    // ===============================
    // 👩‍🏫 TEACHER MANAGEMENT
    // ===============================

    @Transactional
    public Teacher addTeacher(Teacher teacher) {
        // Check for duplicate email
        if (teacherRepository.existsByEmail(teacher.getEmail())) {
            throw new DuplicateEmailException(teacher.getEmail(), "Teacher");
        }

        teacher.setPassword(passwordEncoder.encode(teacher.getPassword()));
        return teacherRepository.save(teacher);
    }

    @Transactional(readOnly = true)
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Transactional(readOnly = true)
    public Page<Teacher> getAllTeachersPaginated(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return teacherRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Teacher getTeacherById(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new TeacherNotFoundException(id));
    }

    @Transactional
    public Teacher updateTeacher(Long id, Teacher updatedTeacher) {
        Teacher existing = teacherRepository.findById(id)
                .orElseThrow(() -> new TeacherNotFoundException(id));

        // Check for duplicate email
        if (teacherRepository.existsByEmailAndIdNot(updatedTeacher.getEmail(), id)) {
            throw new DuplicateEmailException(updatedTeacher.getEmail(), "Teacher");
        }

        existing.setName(updatedTeacher.getName());
        existing.setEmail(updatedTeacher.getEmail());
        existing.setPhone(updatedTeacher.getPhone());
        existing.setDepartment(updatedTeacher.getDepartment());
        existing.setSubject(updatedTeacher.getSubject());
        existing.setSpecialization(updatedTeacher.getSpecialization());
        existing.setQualification(updatedTeacher.getQualification());
        existing.setExperience(updatedTeacher.getExperience());
        existing.setAddress(updatedTeacher.getAddress());
        existing.setCity(updatedTeacher.getCity());
        existing.setState(updatedTeacher.getState());
        existing.setCountry(updatedTeacher.getCountry());
        existing.setDateOfJoining(updatedTeacher.getDateOfJoining());
        existing.setEndDate(updatedTeacher.getEndDate());

        if (updatedTeacher.getPassword() != null && !updatedTeacher.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updatedTeacher.getPassword()));
        }

        return teacherRepository.save(existing);
    }

    @Transactional
    public boolean deleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new TeacherNotFoundException(id);
        }
        teacherRepository.deleteById(id);
        return true;
    }
}