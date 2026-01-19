// src/main/java/com/nekonihongo/backend/controller/AdminMiniTestController.java (NEW CONTROLLER RIÊNG CHO ADMIN – /api/admin/mini-test)

package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.MiniTestSubmissionDTO;
import com.nekonihongo.backend.entity.MiniTestSubmission;
import com.nekonihongo.backend.service.MiniTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/mini-test")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMiniTestController {

    private final MiniTestService miniTestService;

    /**
     * GET /api/admin/mini-test/pending-count
     * Admin: Đếm số bài pending toàn hệ thống
     */
    @GetMapping("/pending-count")
    public ResponseEntity<?> getPendingCount() {
        try {
            long count = miniTestService.getPendingCount();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/mini-test/pending
     * Admin: Lấy danh sách bài pending
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingSubmissions() {
        try {
            List<MiniTestSubmissionDTO> submissions = miniTestService.getPendingSubmissions();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", submissions,
                    "count", submissions.size()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/mini-test/submission/{id}
     * Admin: Lấy chi tiết bài nộp
     */
    @GetMapping("/submission/{id}")
    public ResponseEntity<?> getSubmissionById(@PathVariable Long id) {
        try {
            var submissionOpt = miniTestService.getSubmissionById(id);
            if (submissionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy bài nộp"));
            }

            var submission = submissionOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                    "id", submission.getId(),
                    "userId", submission.getUserId(),
                    "lessonId", submission.getLessonId(),
                    "submittedAt", submission.getSubmittedAt(),
                    "feedback", submission.getFeedback(),
                    "feedbackAt", submission.getFeedbackAt(),
                    "status", submission.getStatus().name(),
                    "timeSpent", submission.getTimeSpent()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * POST /api/admin/mini-test/submission/{id}/feedback
     * Admin: Thêm feedback cho bài nộp
     */
    @PostMapping("/submission/{id}/feedback")
    public ResponseEntity<?> addFeedback(
            @PathVariable Long id,
            @RequestBody Map<String, String> feedbackRequest) {

        try {
            String feedback = feedbackRequest.get("feedback");
            if (feedback == null || feedback.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Feedback không được để trống"));
            }

            var result = miniTestService.provideFeedback(id, feedback.trim());
            return ResponseEntity.ok(Map.of(
                    "success", result.isSuccess(),
                    "message", result.getMessage(),
                    "submissionId", result.getSubmissionId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/mini-test/lesson/{lessonId}/stats
     * Admin: Thống kê bài nộp theo lesson
     */
    @GetMapping("/lesson/{lessonId}/stats")
    public ResponseEntity<?> getLessonStats(@PathVariable Integer lessonId) {
        try {
            long pendingCount = miniTestService.countPendingByLesson(lessonId);
            long feedbackedCount = miniTestService.countFeedbackedByLesson(lessonId);
            List<MiniTestSubmission> submissions = miniTestService.getSubmissionsByLesson(lessonId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of(
                            "lessonId", lessonId,
                            "totalSubmissions", submissions.size(),
                            "pendingCount", pendingCount,
                            "feedbackedCount", feedbackedCount)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }
}