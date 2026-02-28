package com.jvlcode.spring_boot_demo.services;

import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.repository.StudentRepository;
import com.jvlcode.spring_boot_demo.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ===============================
    // 🎓 STUDENT MANAGEMENT
    // ===============================

    public Student addStudent(Student student) {

        // 🔢 Generate Roll Number
        Long lastId = studentRepository.findTopByOrderByIdDesc()
                .map(Student::getId)
                .orElse(0L);

        String rollNo = String.format("STU%03d", lastId + 1);

        student.setRollNo(rollNo);

        // 🔐 Encode password
        student.setPassword(
                passwordEncoder.encode(student.getPassword())
        );

        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentByRollNo(String rollNo) {
        return studentRepository.findByRollNo(rollNo).orElse(null);
    }

    public Student updateStudent(Long id, Student updatedStudent) {

        Student existing = studentRepository.findById(id).orElse(null);
        if (existing == null) return null;

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

        // 🔐 Only update password if provided
        if (updatedStudent.getPassword() != null &&
                !updatedStudent.getPassword().isBlank()) {

            existing.setPassword(
                    passwordEncoder.encode(updatedStudent.getPassword())
            );
        }

        return studentRepository.save(existing);
    }

    public boolean deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) return false;
        studentRepository.deleteById(id);
        return true;
    }

    // ===============================
    // 👩‍🏫 TEACHER MANAGEMENT
    // ===============================

    public Teacher addTeacher(Teacher teacher) {

        teacher.setPassword(
                passwordEncoder.encode(teacher.getPassword())
        );

        return teacherRepository.save(teacher);
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Teacher getTeacherById(Long id) {
        return teacherRepository.findById(id).orElse(null);
    }

    public Teacher updateTeacher(Long id, Teacher updatedTeacher) {

        Teacher existing = teacherRepository.findById(id).orElse(null);
        if (existing == null) return null;

        existing.setName(updatedTeacher.getName());
        existing.setEmail(updatedTeacher.getEmail());
        existing.setPhone(updatedTeacher.getPhone());
        existing.setDepartment(updatedTeacher.getDepartment());
        existing.setQualification(updatedTeacher.getQualification());
        existing.setExperience(updatedTeacher.getExperience());
        existing.setAddress(updatedTeacher.getAddress());
        existing.setCity(updatedTeacher.getCity());
        existing.setState(updatedTeacher.getState());
        existing.setCountry(updatedTeacher.getCountry());
        existing.setDateOfJoining(updatedTeacher.getDateOfJoining());

        if (updatedTeacher.getPassword() != null &&
                !updatedTeacher.getPassword().isBlank()) {

            existing.setPassword(
                    passwordEncoder.encode(updatedTeacher.getPassword())
            );
        }

        return teacherRepository.save(existing);
    }

    public boolean deleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) return false;
        teacherRepository.deleteById(id);
        return true;
    }
}