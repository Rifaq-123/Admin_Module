package com.jvlcode.spring_boot_demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jvlcode.spring_boot_demo.entity.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByEmail(String email);

    Optional<Student> findByEmail(String email);
    Optional<Student> findTopByOrderByIdDesc();
    Optional<Student> findByRollNo(String rollNo);
}