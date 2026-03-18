package com.jvlcode.spring_boot_demo.repository;

import com.jvlcode.spring_boot_demo.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // ✅ Find by email - case insensitive
    @Query("SELECT s FROM Student s WHERE LOWER(s.email) = LOWER(:email)")
    Optional<Student> findByEmail(@Param("email") String email);

    // ✅ Alternative: Simple version (if above doesn't work)
    // Optional<Student> findByEmailIgnoreCase(String email);

    // ✅ Find by roll number
    Optional<Student> findByRollNo(String rollNo);

    // ✅ Check if email exists
    boolean existsByEmail(String email);

    // ✅ Check if email exists (excluding specific ID - for updates)
    @Query("SELECT COUNT(s) > 0 FROM Student s WHERE LOWER(s.email) = LOWER(:email) AND s.id != :id")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("id") Long id);

    // ✅ Get last student for roll number generation
    Optional<Student> findTopByOrderByIdDesc();

    // ✅ Search students with pagination
    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.rollNo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(s.department, '')) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Student> searchStudents(@Param("search") String search, Pageable pageable);

    // ✅ Find by department with pagination
    Page<Student> findByDepartment(String department, Pageable pageable);
}