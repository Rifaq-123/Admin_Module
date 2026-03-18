// services/StudyMaterialService.java
package com.jvlcode.spring_boot_demo.services;

import com.jvlcode.spring_boot_demo.entity.StudyMaterial;
import com.jvlcode.spring_boot_demo.entity.Teacher;
import com.jvlcode.spring_boot_demo.exception.TeacherNotFoundException;
import com.jvlcode.spring_boot_demo.repository.StudyMaterialRepository;
import com.jvlcode.spring_boot_demo.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class StudyMaterialService {

    @Autowired
    private StudyMaterialRepository materialRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Value("${app.upload.dir:uploads/materials}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", 
        "txt", "zip", "rar", "jpg", "jpeg", "png", "gif"
    );

    // ===============================
    // 📤 UPLOAD MATERIAL
    // ===============================

    @Transactional
    public StudyMaterial uploadMaterial(
            Long teacherId,
            MultipartFile file,
            String title,
            String description,
            String subject,
            Integer semester,
            String category
    ) throws IOException {
        
        // Validate teacher
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new TeacherNotFoundException(teacherId));

        // Validate file
        validateFile(file);

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir, teacherId.toString());
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create material record
        StudyMaterial material = new StudyMaterial();
        material.setTeacher(teacher);
        material.setTitle(title);
        material.setDescription(description);
        material.setSubject(subject);
        material.setSemester(semester);
        material.setCategory(category);
        material.setFileName(originalFilename);
        material.setFileType(extension);
        material.setFileSize(file.getSize());
        material.setFilePath(filePath.toString());

        StudyMaterial saved = materialRepository.save(material);
        
        // ✅ Return with teacher already loaded (no lazy loading issue)
        return materialRepository.findByIdWithTeacher(saved.getId())
                .orElse(saved);
    }

    // ===============================
    // 📥 DOWNLOAD MATERIAL
    // ===============================

    @Transactional
    public Resource downloadMaterial(Long materialId) throws MalformedURLException {
        StudyMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        Path filePath = Paths.get(material.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("File not found or not readable");
        }

        // Increment download count
        materialRepository.incrementDownloadCount(materialId);

        return resource;
    }

    // ===============================
    // 📋 GET MATERIALS
    // ===============================

    @Transactional(readOnly = true)
    public List<StudyMaterial> getMaterialsByTeacher(Long teacherId) {
        // ✅ Uses JOIN FETCH - no lazy loading issue
        return materialRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
    }

    @Transactional(readOnly = true)
    public Page<StudyMaterial> getMaterialsByTeacherPaginated(Long teacherId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        // ✅ Uses JOIN FETCH - no lazy loading issue
        return materialRepository.findByTeacherIdWithTeacher(teacherId, pageable);
    }

    @Transactional(readOnly = true)
    public List<StudyMaterial> getMaterialsBySubject(String subject) {
        return materialRepository.findBySubjectOrderByCreatedAtDesc(subject);
    }

    @Transactional(readOnly = true)
    public List<StudyMaterial> searchMaterials(Long teacherId, String search) {
        if (teacherId != null) {
            return materialRepository.searchMaterialsByTeacher(teacherId, search);
        }
        return materialRepository.searchMaterials(search);
    }

    @Transactional(readOnly = true)
    public StudyMaterial getMaterialById(Long id) {
        // ✅ Uses JOIN FETCH - no lazy loading issue
        return materialRepository.findByIdWithTeacher(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));
    }

    @Transactional(readOnly = true)
    public List<String> getSubjectsByTeacher(Long teacherId) {
        return materialRepository.findDistinctSubjectsByTeacherId(teacherId);
    }

    @Transactional(readOnly = true)
    public long countByTeacher(Long teacherId) {
        return materialRepository.countByTeacherId(teacherId);
    }

    // ===============================
    // 📝 UPDATE MATERIAL
    // ===============================

    @Transactional
    public StudyMaterial updateMaterial(
            Long materialId,
            String title,
            String description,
            String subject,
            Integer semester,
            String category
    ) {
        StudyMaterial material = materialRepository.findByIdWithTeacher(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        material.setTitle(title);
        material.setDescription(description);
        material.setSubject(subject);
        material.setSemester(semester);
        material.setCategory(category);

        StudyMaterial saved = materialRepository.save(material);
        
        // ✅ Return with teacher loaded
        return materialRepository.findByIdWithTeacher(saved.getId())
                .orElse(saved);
    }

    // ===============================
    // 🗑️ DELETE MATERIAL
    // ===============================

    @Transactional
    public boolean deleteMaterial(Long materialId, Long teacherId) {
        StudyMaterial material = materialRepository.findByIdWithTeacher(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        // Verify ownership
        if (!material.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("You don't have permission to delete this material");
        }

        // Delete file from disk
        try {
            Path filePath = Paths.get(material.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + e.getMessage());
        }

        // Delete record
        materialRepository.delete(material);
        return true;
    }

    // ===============================
    // 🔧 HELPER METHODS
    // ===============================

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 50MB limit");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new RuntimeException("Invalid file name");
        }

        String extension = getFileExtension(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("File type not allowed. Allowed: " + ALLOWED_EXTENSIONS);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    // ===============================
    // 📊 GET ALL FOR STUDENTS
    // ===============================

    @Transactional(readOnly = true)
    public List<StudyMaterial> getAllMaterialsForStudents() {
        // ✅ Uses JOIN FETCH
        return materialRepository.findAllPublic();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMaterialStats(Long teacherId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<StudyMaterial> materials = materialRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
        
        stats.put("totalMaterials", materials.size());
        stats.put("totalDownloads", materials.stream()
                .mapToLong(m -> m.getDownloadCount() != null ? m.getDownloadCount() : 0)
                .sum());
        stats.put("subjects", materialRepository.findDistinctSubjectsByTeacherId(teacherId));
        
        // Calculate total file size
        long totalSize = materials.stream()
                .mapToLong(m -> m.getFileSize() != null ? m.getFileSize() : 0)
                .sum();
        stats.put("totalSize", totalSize);
        stats.put("totalSizeFormatted", formatFileSize(totalSize));
        
        return stats;
    }

    private String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return String.format("%.2f KB", size / 1024.0);
        if (size < 1024 * 1024 * 1024) return String.format("%.2f MB", size / (1024.0 * 1024));
        return String.format("%.2f GB", size / (1024.0 * 1024 * 1024));
    }
}