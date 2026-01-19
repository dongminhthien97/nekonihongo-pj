// src/main/java/com/nekonihongo/backend/controller/MiniTestApiController.java (FULL CODE HOÀN CHỈNH VỚI FIX SECURITY + CURRENT USER + CONSISTENT)

package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.CheckTestResponseDTO;
import com.nekonihongo.backend.dto.SubmitTestRequestDTO;
import com.nekonihongo.backend.dto.SubmitTestResponseDTO;
import com.nekonihongo.backend.service.MiniTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/grammar-tests") // Giữ path grammar-tests nếu frontend đang dùng, hoặc đổi thành /api/mini-test
                                      // nếu muốn consistent
@RequiredArgsConstructor
public class MiniTestApiController {

    private final MiniTestService miniTestService;

    /**
     * GET /api/grammar-tests/check?lesson_id=X
     * User: Kiểm tra đã submit bài test cho lesson chưa (dùng current user từ
     * token)
     */
    @GetMapping("/check")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> checkTestStatus(@RequestParam("lesson_id") Integer lessonId) {
        try {
            // Lấy current userId từ service (an toàn, không cần param user_id)
            Long userId = miniTestService.getCurrentUserId(); // Đảm bảo service có method này
            CheckTestResponseDTO result = miniTestService.checkUserTestStatus(userId, lessonId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "hasSubmitted", result.isHasSubmitted(),
                    "submissionId", result.getSubmissionId() != null ? result.getSubmissionId() : null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi kiểm tra trạng thái: " + e.getMessage()));
        }
    }

    /**
     * POST /api/grammar-tests/submit
     * User: Submit bài test (dùng current user từ token)
     */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> submitTest(@RequestBody SubmitTestRequestDTO request) {
        try {
            // Set userId từ current user (an toàn, frontend không gửi userId)
            Long userId = miniTestService.getCurrentUserId();
            request.setUserId(userId);

            SubmitTestResponseDTO result = miniTestService.submitTest(request);

            return ResponseEntity.ok(Map.of(
                    "success", result.isSuccess(),
                    "message", result.getMessage(),
                    "testId", result.getTestId(),
                    "submissionId", result.getSubmissionId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi nộp bài: " + e.getMessage()));
        }
    }

    /**
     * POST /api/grammar-tests/{submissionId}/feedback
     * Admin: Thêm feedback cho bài nộp
     */
    @PostMapping("/{submissionId}/feedback")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> provideFeedback(
            @PathVariable Long submissionId,
            @RequestBody Map<String, String> feedbackRequest) {

        try {
            String feedback = feedbackRequest.get("feedback");
            if (feedback == null || feedback.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Feedback không được để trống"));
            }

            SubmitTestResponseDTO result = miniTestService.provideFeedback(submissionId, feedback.trim());

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
}