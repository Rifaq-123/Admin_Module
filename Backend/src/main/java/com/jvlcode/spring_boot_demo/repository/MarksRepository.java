package com.jvlcode.spring_boot_demo.repository;

import com.jvlcode.spring_boot_demo.entity.Marks;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {

    // ✅ Check for duplicate marks
    Optional<Marks> findByStudentIdAndSubjectAndExamTypeAndSemester(
        Long studentId, String subject, String examType, Integer semester
    );

    // ✅ Find by student - simple version
    List<Marks> findByStudentId(Long studentId);

    // ✅ Find by teacher - simple version
    List<Marks> findByTeacherId(Long teacherId);

    // ✅ Optimized: Get by student with JOIN FETCH
    @Query("SELECT m FROM Marks m " +
           "JOIN FETCH m.student s " +
           "JOIN FETCH m.teacher t " +
           "WHERE s.id = :studentId " +
           "ORDER BY m.semester, m.subject")
    List<Marks> findByStudentIdOptimized(@Param("studentId") Long studentId);

    // ✅ Optimized: Get by teacher with JOIN FETCH
    @Query("SELECT m FROM Marks m " +
           "JOIN FETCH m.student s " +
           "JOIN FETCH m.teacher t " +
           "WHERE t.id = :teacherId " +
           "ORDER BY m.id DESC")
    List<Marks> findByTeacherIdOptimized(@Param("teacherId") Long teacherId);

    // ✅ Paginated version for teacher
    @Query(value = "SELECT m FROM Marks m " +
                   "JOIN FETCH m.student s " +
                   "JOIN FETCH m.teacher t " +
                   "WHERE t.id = :teacherId",
           countQuery = "SELECT COUNT(m) FROM Marks m WHERE m.teacher.id = :teacherId")
    Page<Marks> findByTeacherIdPaginated(@Param("teacherId") Long teacherId, Pageable pageable);

    // ✅ Find by student and semester
    List<Marks> findByStudentIdAndSemester(Long studentId, Integer semester);

    // ✅ Calculate CGPA
    @Query("SELECT AVG(m.marksObtained / m.totalMarks * 10) FROM Marks m WHERE m.student.id = :studentId")
    Double calculateCGPA(@Param("studentId") Long studentId);

    // ✅ Count by teacher
    long countByTeacherId(Long teacherId);

    // ✅ NEW: Count by student
    long countByStudentId(Long studentId);
}