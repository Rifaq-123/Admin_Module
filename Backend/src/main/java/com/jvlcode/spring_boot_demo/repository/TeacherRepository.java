package com.jvlcode.spring_boot_demo.repository;

import com.jvlcode.spring_boot_demo.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    // ✅ Find by email
    Optional<Teacher> findByEmail(String email);

    // ✅ Check if email exists
    boolean existsByEmail(String email);

    // ✅ Check if email exists (excluding specific ID)
    @Query("SELECT COUNT(t) > 0 FROM Teacher t WHERE t.email = :email AND t.id != :id")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("id") Long id);
}