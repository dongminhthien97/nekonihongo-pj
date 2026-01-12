// src/main/java/com/nekonihongo/backend/service/MiniTestSubmissionService.java (full service với logic xử lý pending count)
package com.nekonihongo.backend.service;

import com.nekonihongo.backend.entity.MiniTestSubmission;
import com.nekonihongo.backend.entity.MiniTestSubmission.Status;
import com.nekonihongo.backend.repository.MiniTestSubmissionRepository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true) // Default readOnly cho query, override khi cần write
public class MiniTestSubmissionService {

    @Autowired
    private MiniTestSubmissionRepository repository;

    /**
     * Nếu bạn muốn dùng status (pending/feedbacked) thay vì feedback NULL
     * Uncomment và dùng method này
     */
    // public long getPendingCount() {
    // return repository.countByStatus("pending");
    // }

    /**
     * Các method khác nếu cần mở rộng (submit, get list, add feedback, etc.)
     */

    // Ví dụ: Lưu submission mới
    @Transactional
    public MiniTestSubmission submit(MiniTestSubmission submission) {
        submission.setSubmittedAt(LocalDateTime.now());
        // Có thể thêm logic validate answers, tính điểm tự động nếu có correct_answer,
        // etc.
        return repository.save(submission);
    }

    // Ví dụ: Admin add feedback
    @Transactional
    public MiniTestSubmission addFeedback(Long id, String feedback) {
        MiniTestSubmission submission = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp"));

        submission.setFeedback(feedback);
        submission.setFeedbackAt(LocalDateTime.now());

        // Nếu dùng status
        // submission.setStatus("feedbacked");

        return repository.save(submission);
    }

    // Ví dụ: Lấy danh sách pending cho admin
    public List<MiniTestSubmission> getPendingSubmissions() {
        return repository.findByFeedbackIsNullOrderBySubmittedAtDesc();
    }

    public long getPendingCount() {
        return repository.countByStatus(Status.pending);
    }
}