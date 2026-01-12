package com.nekonihongo.backend.repository;

// src/main/java/com/nekonihongo/backend/repository/MiniTestSubmissionRepository.java (update với method cần thiết)

import com.nekonihongo.backend.entity.MiniTestSubmission;
import com.nekonihongo.backend.entity.MiniTestSubmission.Status;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MiniTestSubmissionRepository extends JpaRepository<MiniTestSubmission, Long> {

    // Đếm bài chưa feedback
    long countByFeedbackIsNull();

    // Lấy danh sách pending, sắp xếp mới nhất trước
    List<MiniTestSubmission> findByFeedbackIsNullOrderBySubmittedAtDesc();

    // Nếu dùng status
    long countByStatus(Status status);
    // List<MiniTestSubmission> findByStatusOrderBySubmittedAtDesc(String status);
}