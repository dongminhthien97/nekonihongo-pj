// src/main/java/com/nekonihongo/backend/repository/UserRepository.java
package com.nekonihongo.backend.repository;

import com.nekonihongo.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm user bằng email (dùng cho login)
    Optional<User> findByEmail(String email);

    // Kiểm tra email đã tồn tại chưa
    boolean existsByEmail(String email);

    // Tìm user bằng username (nếu cần)
    Optional<User> findByUsername(String username);

    // Đếm số user theo role (dùng cho dashboard admin)
    long countByRole(User.Role role);

    // Tìm tất cả user có role USER (phân trang sau này)
    // Page<User> findByRole(User.Role role, Pageable pageable);
}