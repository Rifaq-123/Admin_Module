package com.jvlcode.spring_boot_demo.services;

import com.jvlcode.spring_boot_demo.entity.Admin;
import com.jvlcode.spring_boot_demo.entity.Student;
import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.repository.AdminRepository;
import com.jvlcode.spring_boot_demo.repository.StudentRepository;
import com.jvlcode.spring_boot_demo.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepository adminRepo;

    @Autowired
    private TeacherRepository teacherRepo;

    @Autowired
    private StudentRepository studentRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        // Normalize email to lowercase
        String normalizedUsername = username != null ? username.trim().toLowerCase() : "";
        
        System.out.println("\n========================================");
        System.out.println("🔍 CustomUserDetailsService");
        System.out.println("   Input username: " + username);
        System.out.println("   Normalized: " + normalizedUsername);
        System.out.println("========================================");

        // Try Admin first
        Optional<Admin> adminOpt = adminRepo.findByUsername(normalizedUsername);
        if (adminOpt.isPresent()) {
            System.out.println("✅ Found ADMIN: " + normalizedUsername);
            Admin admin = adminOpt.get();
            return new User(
                    admin.getUsername(),
                    admin.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
            );
        }
        System.out.println("   ❌ Not an Admin");

        // Try Teacher by email
        Optional<Teacher> teacherOpt = teacherRepo.findByEmail(normalizedUsername);
        if (teacherOpt.isPresent()) {
            System.out.println("✅ Found TEACHER: " + normalizedUsername);
            Teacher teacher = teacherOpt.get();
            return new User(
                    teacher.getEmail(),
                    teacher.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_TEACHER"))
            );
        }
        System.out.println("   ❌ Not a Teacher");

        // Try Student by email - MOST IMPORTANT
        System.out.println("   🔍 Searching STUDENT by email: " + normalizedUsername);
        
        // Debug: List all students
        List<Student> allStudents = studentRepo.findAll();
        System.out.println("   📋 Total students in DB: " + allStudents.size());
        for (Student s : allStudents) {
            System.out.println("      - " + s.getEmail() + " (ID: " + s.getId() + ")");
        }
        
        Optional<Student> studentOpt = studentRepo.findByEmail(normalizedUsername);
        
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            System.out.println("✅ Found STUDENT!");
            System.out.println("   ID: " + student.getId());
            System.out.println("   Email: " + student.getEmail());
            System.out.println("   Name: " + student.getName());
            System.out.println("   RollNo: " + student.getRollNo());
            System.out.println("   Password Hash Length: " + student.getPassword().length());
            System.out.println("   Password Hash: " + student.getPassword());
            
            UserDetails userDetails = new User(
                    student.getEmail(),
                    student.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
            );
            
            System.out.println("   ✅ Returning UserDetails for: " + userDetails.getUsername());
            System.out.println("========================================\n");
            
            return userDetails;
        }
        
        System.out.println("❌ STUDENT NOT FOUND!");
        System.out.println("   Searched for: " + normalizedUsername);
        System.out.println("========================================\n");
        
        throw new UsernameNotFoundException("User not found: " + username);
    }
}