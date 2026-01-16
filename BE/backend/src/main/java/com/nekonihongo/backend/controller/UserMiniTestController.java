package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.MiniTestSubmissionDTO;
import com.nekonihongo.backend.service.MiniTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/mini-test")
@RequiredArgsConstructor // Thay @Autowired
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')") // Cho phép cả USER và ADMIN
public class UserMiniTestController {

    private final MiniTestService miniTestService; // Đổi tên service

    /**
     * GET /api/user/mini-test/submissions
     * Lấy danh sách bài nộp mini test của user hiện tại
     */
    @GetMapping("/submissions")
    public ResponseEntity<?> getUserSubmissions() {
        try {
            List<MiniTestSubmissionDTO> submissions = miniTestService.getUserSubmissions();
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/user/mini-test/submission/{id}
     * Xóa bài nộp (chỉ của chính user)
     */
    @DeleteMapping("/submission/{id}")
    public ResponseEntity<?> deleteUserSubmission(@PathVariable Long id) {
        try {
            miniTestService.deleteUserSubmission(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Xóa bài nộp thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * GET /api/user/mini-test/feedback-count
     * Đếm số bài đã được admin feedback (cho bell badge đỏ)
     */
    @GetMapping("/feedback-count")
    public ResponseEntity<?> getFeedbackCount() {
        try {
            int count = miniTestService.getUserFeedbackCount();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * GET /api/user/mini-test/pending-count
     * Admin: Đếm số bài pending toàn hệ thống
     */
    @GetMapping("/pending-count")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ admin
    public ResponseEntity<?> getPendingCount() {
        try {
            long count = miniTestService.getPendingCount();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * GET /api/user/mini-test/pending
     * Admin: Lấy danh sách bài pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ admin
    public ResponseEntity<?> getPendingSubmissions() {
        try {
            List<MiniTestSubmissionDTO> submissions = miniTestService.getPendingSubmissions();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", submissions,
                    "count", submissions.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Lỗi: " + e.getMessage()));
        }
    }
}