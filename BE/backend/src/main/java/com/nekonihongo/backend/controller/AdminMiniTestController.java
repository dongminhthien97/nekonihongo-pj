// src/main/java/com/nekonihongo/backend/controller/AdminMiniTestController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.MiniTestSubmissionDTO;
import com.nekonihongo.backend.entity.MiniTestSubmission;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.service.MiniTestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/mini-test")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminMiniTestController {

    private final MiniTestService miniTestService;

    /**
     * GET /api/admin/mini-test (root path)
     * Admin: Lấy danh sách bài nộp (all hoặc pending dựa trên param filter)
     * filter=pending → pending
     * filter=all hoặc default → all submissions
     */
    @GetMapping("")
    public ResponseEntity<?> getSubmissions(
            @RequestParam(name = "filter", required = false, defaultValue = "all") String filter) {

        try {
            List<MiniTestSubmissionDTO> submissions;

            if ("pending".equalsIgnoreCase(filter)) {
                submissions = miniTestService.getPendingSubmissions();
            } else {
                submissions = miniTestService.getAllSubmissions();
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", submissions,
                    "total", submissions.size()));
        } catch (Exception e) {
            log.error("Error getting submissions with filter: {}", filter, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

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
            log.error("Error getting pending count", e);
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
            log.error("Error getting pending submissions", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/mini-test/submissions
     * Admin: Lấy tất cả submissions (có phân trang)
     */
    @GetMapping("/submissions")
    public ResponseEntity<?> getAllSubmissions(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sortBy", defaultValue = "submittedAt") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction) {

        try {
            Sort sort = direction.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            List<MiniTestSubmissionDTO> submissions = miniTestService.getAllSubmissions();

            // Thực hiện phân trang thủ công vì service trả về List
            int start = Math.min(page * size, submissions.size());
            int end = Math.min((page + 1) * size, submissions.size());
            List<MiniTestSubmissionDTO> pagedSubmissions = submissions.subList(start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", pagedSubmissions);
            response.put("currentPage", page);
            response.put("totalItems", submissions.size());
            response.put("totalPages", (int) Math.ceil((double) submissions.size() / size));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting all submissions", e);
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
                    "timeSpent", submission.getTimeSpent(),
                    "score", submission.getScore()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting submission by id: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/mini-test/{submissionId}/details
     * Admin: Lấy chi tiết bài làm với thông tin user và answers
     */
    @GetMapping("/{submissionId}/details")
    public ResponseEntity<?> getSubmissionDetails(@PathVariable Long submissionId) {
        try {
            Optional<MiniTestSubmission> submissionOpt = miniTestService.getSubmissionById(submissionId);
            if (submissionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy bài nộp"));
            }

            MiniTestSubmission submission = submissionOpt.get();
            Optional<User> userOpt = miniTestService.getUserInfoForSubmission(submissionId);

            // Parse answers từ JSON
            List<MiniTestSubmissionDTO.AnswerDTO> answers = miniTestService
                    .parseAnswersToDtoList(submission.getAnswers());

            Map<String, Object> submissionData = new HashMap<>();
            submissionData.put("id", submission.getId());
            submissionData.put("userId", submission.getUserId());
            submissionData.put("lessonId", submission.getLessonId());
            submissionData.put("score", submission.getScore());
            submissionData.put("status", submission.getStatus().name());
            submissionData.put("feedback", submission.getFeedback());
            submissionData.put("feedbackAt", submission.getFeedbackAt());
            submissionData.put("submittedAt", submission.getSubmittedAt());
            submissionData.put("timeSpent", submission.getTimeSpent());
            submissionData.put("answers", answers);

            // User info
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                submissionData.put("userName", user.getFullName() != null ? user.getFullName() : user.getUsername());
                submissionData.put("userEmail", user.getEmail());
            } else {
                submissionData.put("userName", "User " + submission.getUserId());
                submissionData.put("userEmail", "N/A");
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", submissionData));
        } catch (Exception e) {
            log.error("Error getting submission details: {}", submissionId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * POST /api/admin/mini-test/submission/{id}/feedback
     * Admin: Thêm feedback và điểm cho bài nộp
     */
    @PostMapping("/submission/{id}/feedback")
    public ResponseEntity<?> addFeedbackWithScore(
            @PathVariable Long id,
            @RequestBody Map<String, Object> feedbackRequest) {

        try {
            String feedback = (String) feedbackRequest.get("feedback");
            Integer score = null;

            // Lấy điểm nếu có
            if (feedbackRequest.containsKey("score")) {
                Object scoreObj = feedbackRequest.get("score");
                if (scoreObj != null) {
                    if (scoreObj instanceof Integer) {
                        score = (Integer) scoreObj;
                    } else if (scoreObj instanceof Double) {
                        score = ((Double) scoreObj).intValue();
                    } else if (scoreObj instanceof String) {
                        try {
                            score = Integer.parseInt((String) scoreObj);
                        } catch (NumberFormatException e) {
                            // Không xử lý, giữ null
                        }
                    }
                }
            }

            if (feedback == null || feedback.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Feedback không được để trống"));
            }

            var result = miniTestService.scoreAndFeedback(id, feedback.trim(), score);
            return ResponseEntity.ok(Map.of(
                    "success", result.isSuccess(),
                    "message", result.getMessage(),
                    "submissionId", result.getSubmissionId()));
        } catch (Exception e) {
            log.error("Error adding feedback for submission: {}", id, e);
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
            log.error("Error getting lesson stats for lesson: {}", lessonId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/mini-test/search
     * Admin: Tìm kiếm submissions
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchSubmissions(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "lessonId", required = false) Integer lessonId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        try {
            // Lấy tất cả submissions trước
            List<MiniTestSubmissionDTO> allSubmissions = miniTestService.getAllSubmissions();

            // Áp dụng filter
            List<MiniTestSubmissionDTO> filteredSubmissions = allSubmissions.stream()
                    .filter(submission -> {
                        boolean matches = true;

                        // Filter by keyword
                        if (keyword != null && !keyword.isEmpty()) {
                            String keywordLower = keyword.toLowerCase();
                            matches = (submission.getUserName() != null
                                    && submission.getUserName().toLowerCase().contains(keywordLower))
                                    || (submission.getUserEmail() != null
                                            && submission.getUserEmail().toLowerCase().contains(keywordLower))
                                    || (submission.getLessonTitle() != null
                                            && submission.getLessonTitle().toLowerCase().contains(keywordLower))
                                    || String.valueOf(submission.getLessonId()).contains(keyword);
                        }

                        // Filter by status
                        if (status != null && !status.isEmpty()) {
                            matches = matches && submission.getStatus().equalsIgnoreCase(status);
                        }

                        // Filter by lessonId
                        if (lessonId != null) {
                            matches = matches && submission.getLessonId().equals(lessonId.longValue());
                        }

                        return matches;
                    })
                    .collect(Collectors.toList());

            // Phân trang
            int start = Math.min(page * size, filteredSubmissions.size());
            int end = Math.min((page + 1) * size, filteredSubmissions.size());
            List<MiniTestSubmissionDTO> pagedSubmissions = filteredSubmissions.subList(start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", pagedSubmissions);
            response.put("currentPage", page);
            response.put("totalItems", filteredSubmissions.size());
            response.put("totalPages", (int) Math.ceil((double) filteredSubmissions.size() / size));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching submissions: ", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * POST /api/admin/mini-test/mark-all-read
     * Admin: Đánh dấu tất cả bài pending là đã đọc (feedback)
     */
    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead() {
        try {
            List<MiniTestSubmissionDTO> pendingSubmissions = miniTestService.getPendingSubmissions();

            int markedCount = 0;
            LocalDateTime now = LocalDateTime.now();

            for (MiniTestSubmissionDTO submission : pendingSubmissions) {
                var result = miniTestService.provideFeedback(submission.getId(), "Đã xem");
                if (result.isSuccess()) {
                    markedCount++;
                }
            }

            log.info("Marked {} pending submissions as read", markedCount);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã đánh dấu " + markedCount + " bài là đã đọc",
                    "markedCount", markedCount));
        } catch (Exception e) {
            log.error("Error marking all as read: ", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/mini-test/submission/{id}
     * Admin: Xóa bài nộp
     */
    @DeleteMapping("/submission/{id}")
    public ResponseEntity<?> deleteSubmission(@PathVariable Long id) {
        try {
            var result = miniTestService.deleteUserSubmission(id);
            return ResponseEntity.ok(Map.of(
                    "success", result.isSuccess(),
                    "message", result.getMessage(),
                    "submissionId", result.getSubmissionId()));
        } catch (Exception e) {
            log.error("Error deleting submission: {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi server: " + e.getMessage()));
        }
    }
}