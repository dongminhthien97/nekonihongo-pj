// src/main/java/com/nekonihongo/backend/repository/MiniTestSubmissionRepository.java (FULL CODE REPOSITORY HOÀN CHỈNH VỚI STATUS)

package com.nekonihongo.backend.repository;

import com.nekonihongo.backend.entity.MiniTestSubmission;
import com.nekonihongo.backend.entity.MiniTestSubmission.Status;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MiniTestSubmissionRepository extends JpaRepository<MiniTestSubmission, Long> {

    // ADMIN: Đếm số bài pending (toàn hệ thống)
    long countByStatus(Status status);

    // ADMIN: Lấy danh sách bài pending, sort mới nhất trước
    List<MiniTestSubmission> findByStatusOrderBySubmittedAtDesc(Status status);

    // USER: Lấy submissions của user hiện tại, sort mới nhất trước
    List<MiniTestSubmission> findByUserIdOrderBySubmittedAtDesc(Long userId);

    // USER: Đếm số bài đã feedback của user (cho bell badge)
    long countByUserIdAndStatus(Long userId, Status status);

    // Optional: Lấy submissions của user với status cụ thể (nếu cần filter
    // pending/feedbacked)
    List<MiniTestSubmission> findByUserIdAndStatusOrderBySubmittedAtDesc(Long userId, Status status);
}