package com.jvlcode.spring_boot_demo.repository;

import com.jvlcode.spring_boot_demo.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // ✅ Check for duplicate attendance
    Optional<Attendance> findByStudentIdAndDateAndSubject(Long studentId, LocalDate date, String subject);

    // ✅ Find by student - simple version
    List<Attendance> findByStudentId(Long studentId);

    // ✅ Find by teacher - simple version
    List<Attendance> findByTeacherId(Long teacherId);

    // ✅ Optimized: Get by student with JOIN FETCH
    @Query("SELECT a FROM Attendance a " +
           "JOIN FETCH a.student s " +
           "JOIN FETCH a.teacher t " +
           "WHERE s.id = :studentId " +
           "ORDER BY a.date DESC")
    List<Attendance> findByStudentIdOptimized(@Param("studentId") Long studentId);

    // ✅ Optimized: Get by teacher with JOIN FETCH
    @Query("SELECT a FROM Attendance a " +
           "JOIN FETCH a.student s " +
           "JOIN FETCH a.teacher t " +
           "WHERE t.id = :teacherId " +
           "ORDER BY a.date DESC")
    List<Attendance> findByTeacherIdOptimized(@Param("teacherId") Long teacherId);

    // ✅ Paginated version for teacher
    @Query(value = "SELECT a FROM Attendance a " +
                   "JOIN FETCH a.student s " +
                   "JOIN FETCH a.teacher t " +
                   "WHERE t.id = :teacherId",
           countQuery = "SELECT COUNT(a) FROM Attendance a WHERE a.teacher.id = :teacherId")
    Page<Attendance> findByTeacherIdPaginated(@Param("teacherId") Long teacherId, Pageable pageable);

    // ✅ Count by teacher
    long countByTeacherId(Long teacherId);

    // ✅ Count present by student
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.isPresent = true")
    long countPresentByStudentId(@Param("studentId") Long studentId);

    // ✅ Count total by student
    long countByStudentId(Long studentId);
}