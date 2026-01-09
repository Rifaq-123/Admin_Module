package com.jvlcode.spring_boot_demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jvlcode.spring_boot_demo.entity.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
	
}