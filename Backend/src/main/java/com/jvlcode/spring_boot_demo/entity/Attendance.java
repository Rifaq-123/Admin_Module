package com.jvlcode.spring_boot_demo.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance", 
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_attendance_student_date_subject",
            columnNames = {"student_id", "date", "subject"}
        )
    },
    indexes = {
        @Index(name = "idx_attendance_student", columnList = "student_id"),
        @Index(name = "idx_attendance_teacher", columnList = "teacher_id"),
        @Index(name = "idx_attendance_date", columnList = "date"),
        @Index(name = "idx_attendance_subject", columnList = "subject"),
        @Index(name = "idx_attendance_student_date", columnList = "student_id, date")
    }
)
@EntityListeners(AuditingEntityListener.class)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Teacher teacher;

    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    @JsonFormat(pattern = "dd-MM-yyyy")
    @Column(nullable = false)
    private LocalDate date;

    @NotBlank(message = "Subject is required")
    @Size(max = 100, message = "Subject cannot exceed 100 characters")
    @Column(nullable = false)
    private String subject;

    @NotNull(message = "Attendance status is required")
    @Column(nullable = false)
    private Boolean isPresent;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    private String remarks;

    // Audit fields
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public Attendance() {}

    public Attendance(Student student, Teacher teacher, LocalDate date, 
                      String subject, Boolean isPresent, String remarks) {
        this.student = student;
        this.teacher = teacher;
        this.date = date;
        this.subject = subject;
        this.isPresent = isPresent;
        this.remarks = remarks;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public Boolean getIsPresent() { return isPresent; }
    public void setIsPresent(Boolean isPresent) { this.isPresent = isPresent; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}