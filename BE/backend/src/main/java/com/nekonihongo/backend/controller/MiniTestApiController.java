package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.CheckTestResponseDTO;
import com.nekonihongo.backend.dto.SubmitTestRequestDTO;
import com.nekonihongo.backend.dto.SubmitTestResponseDTO;
import com.nekonihongo.backend.service.MiniTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MiniTestApiController {

    private final MiniTestService miniTestService;

    /**
     * GET /api/grammar-tests/check?lesson_id=X&user_id=Y
     * Kiểm tra user đã làm test chưa
     */
    @GetMapping("/grammar-tests/check")
    public ResponseEntity<?> checkTestStatus(
            @RequestParam("lesson_id") Integer lessonId,
            @RequestParam("user_id") Long userId) {

        try {
            CheckTestResponseDTO result = miniTestService.checkUserTestStatus(userId, lessonId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "hasSubmitted", result.isHasSubmitted(),
                    "submissionId", result.getSubmissionId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * POST /api/grammar-tests/submit
     * Submit bài test
     */
    @PostMapping("/grammar-tests/submit")
    public ResponseEntity<?> submitTest(@RequestBody SubmitTestRequestDTO request) {
        try {
            SubmitTestResponseDTO result = miniTestService.submitTest(request);
            return ResponseEntity.ok(Map.of(
                    "success", result.isSuccess(),
                    "message", result.getMessage(),
                    "testId", result.getTestId(),
                    "submissionId", result.getSubmissionId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * POST /api/grammar-tests/{submissionId}/feedback
     * Admin thêm feedback
     */
    @PostMapping("/grammar-tests/{submissionId}/feedback")
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
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi: " + e.getMessage()));
        }
    }
}