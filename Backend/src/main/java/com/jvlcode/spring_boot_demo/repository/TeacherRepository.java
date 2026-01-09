package com.jvlcode.spring_boot_demo.repository;

import com.jvlcode.spring_boot_demo.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
	
}
