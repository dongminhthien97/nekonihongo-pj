// src/main/java/com/nekonihongo/backend/controller/UserMiniTestController.java (FULL CODE FIX 404 – THÊM /api PREFIX)

package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.MiniTestSubmissionDTO;
import com.nekonihongo.backend.service.MiniTestSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/mini-test") // ← FIX: Thêm /api prefix để khớp frontend call /api/user/mini-test/...
@PreAuthorize("hasRole('USER')") // Chỉ user thường truy cập
public class UserMiniTestController {

    @Autowired
    private MiniTestSubmissionService service;

    /**
     * GET /api/user/mini-test/submissions
     * Lấy danh sách bài nộp mini test của user hiện tại
     */
    @GetMapping("/submissions")
    public ResponseEntity<List<MiniTestSubmissionDTO>> getUserSubmissions() {
        List<MiniTestSubmissionDTO> submissions = service.getUserSubmissions();
        return ResponseEntity.ok(submissions);
    }

    /**
     * DELETE /api/user/mini-test/submission/{id}
     * Xóa bài nộp (chỉ của chính user)
     */
    @DeleteMapping("/submission/{id}")
    public ResponseEntity<Map<String, String>> deleteUserSubmission(@PathVariable Long id) {
        service.deleteUserSubmission(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa bài nộp thành công");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/user/mini-test/feedback-count
     * Đếm số bài đã được admin feedback (cho bell badge đỏ)
     */
    @GetMapping("/feedback-count")
    public ResponseEntity<Map<String, Integer>> getFeedbackCount() {
        int count = service.getUserFeedbackCount();
        Map<String, Integer> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}