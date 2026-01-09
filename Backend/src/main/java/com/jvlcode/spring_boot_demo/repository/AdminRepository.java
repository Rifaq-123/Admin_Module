package com.jvlcode.spring_boot_demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jvlcode.spring_boot_demo.entity.Admin;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUsername(String username);
}
