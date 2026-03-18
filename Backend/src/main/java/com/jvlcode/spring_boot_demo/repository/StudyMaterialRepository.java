// repository/StudyMaterialRepository.java
package com.jvlcode.spring_boot_demo.repository;

import com.jvlcode.spring_boot_demo.entity.StudyMaterial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {

    // ✅ Find by teacher with JOIN FETCH
    @Query("SELECT sm FROM StudyMaterial sm JOIN FETCH sm.teacher WHERE sm.teacher.id = :teacherId ORDER BY sm.createdAt DESC")
    List<StudyMaterial> findByTeacherIdOrderByCreatedAtDesc(@Param("teacherId") Long teacherId);

    // ✅ Find by teacher (paginated) with JOIN FETCH
    @Query(value = "SELECT sm FROM StudyMaterial sm JOIN FETCH sm.teacher WHERE sm.teacher.id = :teacherId",
           countQuery = "SELECT COUNT(sm) FROM StudyMaterial sm WHERE sm.teacher.id = :teacherId")
    Page<StudyMaterial> findByTeacherIdWithTeacher(@Param("teacherId") Long teacherId, Pageable pageable);

    // ✅ Find by ID with teacher
    @Query("SELECT sm FROM StudyMaterial sm JOIN FETCH sm.teacher WHERE sm.id = :id")
    Optional<StudyMaterial> findByIdWithTeacher(@Param("id") Long id);

    // ✅ Find by subject with teacher
    @Query("SELECT sm FROM StudyMaterial sm JOIN FETCH sm.teacher WHERE sm.subject = :subject ORDER BY sm.createdAt DESC")
    List<StudyMaterial> findBySubjectOrderByCreatedAtDesc(@Param("subject") String subject);

    // Find by teacher and subject
    @Query("SELECT sm FROM StudyMaterial sm JOIN FETCH sm.teacher WHERE sm.teacher.id = :teacherId AND sm.subject = :subject ORDER BY sm.createdAt DESC")
    List<StudyMaterial> findByTeacherIdAndSubjectOrderByCreatedAtDesc(
        @Param("teacherId") Long teacherId, 
        @Param("subject") String subject
    );

    // Search materials
    @Query("SELECT sm FROM StudyMaterial sm JOIN FETCH sm.teacher WHERE " +
           "LOWER(sm.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sm.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sm.subject) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<StudyMaterial> searchMaterials(@Param("search") String search);

    // Search materials by teacher
    @Query("SELECT sm FROM StudyMaterial sm JOIN FETCH sm.teacher WHERE sm.teacher.id = :teacherId AND (" +
           "LOWER(sm.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sm.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(sm.subject) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<StudyMaterial> searchMaterialsByTeacher(
        @Param("teacherId") Long teacherId, 
        @Param("search") String search
    );

    // Count by teacher
    long countByTeacherId(Long teacherId);

    // Get unique subjects by teacher
    @Query("SELECT DISTINCT sm.subject FROM StudyMaterial sm WHERE sm.teacher.id = :teacherId ORDER BY sm.subject")
    List<String> findDistinctSubjectsByTeacherId(@Param("teacherId") Long teacherId);

    // ✅ Get all materials for students (public) with teacher
    @Query("SELECT sm FROM StudyMaterial sm JOIN FETCH sm.teacher ORDER BY sm.createdAt DESC")
    List<StudyMaterial> findAllPublic();

    // Increment download count
    @Modifying
    @Query("UPDATE StudyMaterial sm SET sm.downloadCount = sm.downloadCount + 1 WHERE sm.id = :id")
    void incrementDownloadCount(@Param("id") Long id);
}