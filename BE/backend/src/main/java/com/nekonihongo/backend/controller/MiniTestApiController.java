package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.CheckTestResponseDTO;
import com.nekonihongo.backend.dto.SubmitTestRequestDTO;
import com.nekonihongo.backend.dto.SubmitTestResponseDTO;
import com.nekonihongo.backend.service.MiniTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/grammar-tests")
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
    public ResponseEntity<?> checkTestStatus(
            @RequestParam(value = "lessonId", required = false) Integer lessonId,
            @RequestParam(value = "lesson_id", required = false) Integer lessonIdLegacy) {

        // Support both names, prefer lessonId
        Integer id = (lessonId != null) ? lessonId : lessonIdLegacy;

        if (id == null) {
            throw new IllegalArgumentException("lessonId is required");
        }

        if (id <= 0) {
            throw new IllegalArgumentException("lessonId must be a positive integer");
        }

        // Lấy current userId từ service
        Long userId = miniTestService.getCurrentUserId();

        CheckTestResponseDTO result = miniTestService.checkUserTestStatus(userId, id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("hasSubmitted", result.isHasSubmitted());

        if (result.getSubmissionId() != null) {
            response.put("submissionId", result.getSubmissionId());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/grammar-tests/submit
     * User: Submit bài test (dùng current user từ token)
     */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> submitTest(@RequestBody SubmitTestRequestDTO request) {
        // Set userId từ current user (an toàn, frontend không gửi userId)
        Long userId = miniTestService.getCurrentUserId();
        request.setUserId(userId);

        SubmitTestResponseDTO result = miniTestService.submitTest(request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.isSuccess());
        response.put("message", result.getMessage());

        if (result.getTestId() != null) {
            response.put("testId", result.getTestId());
        }

        if (result.getSubmissionId() != null) {
            response.put("submissionId", result.getSubmissionId());
        }

        return ResponseEntity.ok(response);
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

        String feedback = feedbackRequest.get("feedback");
        if (feedback == null || feedback.trim().isEmpty()) {
            throw new IllegalArgumentException("Feedback không được để trống");
        }

        SubmitTestResponseDTO result = miniTestService.provideFeedback(submissionId,
                feedback.trim());

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.isSuccess());
        response.put("message", result.getMessage());

        if (result.getSubmissionId() != null) {
            response.put("submissionId", result.getSubmissionId());
        }

        return ResponseEntity.ok(response);
    }
}