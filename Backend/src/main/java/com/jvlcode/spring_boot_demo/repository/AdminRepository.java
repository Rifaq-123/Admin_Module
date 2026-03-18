package com.jvlcode.spring_boot_demo.repository;

import com.jvlcode.spring_boot_demo.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    
    Optional<Admin> findByUsername(String username);
    
    boolean existsByUsername(String username);
}