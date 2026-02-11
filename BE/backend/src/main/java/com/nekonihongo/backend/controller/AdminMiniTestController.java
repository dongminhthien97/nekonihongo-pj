package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.MiniTestSubmissionDTO;
import com.nekonihongo.backend.entity.MiniTestSubmission;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.GrammarQuestionRepository;
import com.nekonihongo.backend.service.MiniTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/admin/mini-test", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMiniTestController {

    private final MiniTestService miniTestService;
    private final GrammarQuestionRepository grammarQuestionRepository;

    @GetMapping("")
    public ResponseEntity<ApiResponse<List<MiniTestSubmissionDTO>>> getSubmissions(
            @RequestParam(name = "filter", required = false, defaultValue = "all") String filter) {

        try {
            List<MiniTestSubmissionDTO> submissions;

            if ("pending".equalsIgnoreCase(filter)) {
                submissions = miniTestService.getPendingSubmissions();
            } else {
                submissions = miniTestService.getAllSubmissions();
            }

            return ResponseEntity.ok(ApiResponse.success(submissions));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @GetMapping("/pending-count")
    public ResponseEntity<ApiResponse<Long>> getPendingCount() {
        try {
            long count = miniTestService.getPendingCount();
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<MiniTestSubmissionDTO>>> getPendingSubmissions() {
        try {
            List<MiniTestSubmissionDTO> submissions = miniTestService.getPendingSubmissions();
            return ResponseEntity.ok(ApiResponse.success(submissions));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllSubmissions(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sortBy", defaultValue = "submittedAt") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction) {

        try {
            Sort sort = direction.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            List<MiniTestSubmissionDTO> submissions = miniTestService.getAllSubmissions();

            int start = Math.min(page * size, submissions.size());
            int end = Math.min((page + 1) * size, submissions.size());
            List<MiniTestSubmissionDTO> pagedSubmissions = submissions.subList(start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("data", pagedSubmissions);
            response.put("currentPage", page);
            response.put("totalItems", submissions.size());
            response.put("totalPages", (int) Math.ceil((double) submissions.size() / size));

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @GetMapping("/submission/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSubmissionById(@PathVariable(name = "id") Long id) {
        try {
            var submissionOpt = miniTestService.getSubmissionById(id);
            if (submissionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Submission not found", "NOT_FOUND"));
            }

            var submission = submissionOpt.get();
            Map<String, Object> submissionData = new HashMap<>();
            submissionData.put("id", submission.getId());
            submissionData.put("userId", submission.getUserId());
            submissionData.put("lessonId", submission.getLessonId());
            submissionData.put("submittedAt", submission.getSubmittedAt());
            submissionData.put("feedback", submission.getFeedback());
            submissionData.put("feedbackAt", submission.getFeedbackAt());
            submissionData.put("status", submission.getStatus().name());
            submissionData.put("timeSpent", submission.getTimeSpent());
            submissionData.put("score", submission.getScore());

            return ResponseEntity.ok(ApiResponse.success(submissionData));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @GetMapping("/{submissionId}/details")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSubmissionDetails(
            @PathVariable(name = "submissionId") Long submissionId) {
        try {
            Optional<MiniTestSubmission> submissionOpt = miniTestService.getSubmissionById(submissionId);
            if (submissionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Submission not found", "NOT_FOUND"));
            }

            MiniTestSubmission submission = submissionOpt.get();
            Optional<User> userOpt = miniTestService.getUserInfoForSubmission(submissionId);

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

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                submissionData.put("userName", user.getFullName() != null ? user.getFullName() : user.getUsername());
                submissionData.put("userEmail", user.getEmail());
            } else {
                submissionData.put("userName", "User " + submission.getUserId());
                submissionData.put("userEmail", "N/A");
            }

            return ResponseEntity.ok(ApiResponse.success(submissionData));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @PostMapping("/submission/{id}/feedback")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addFeedbackWithScore(
            @PathVariable(name = "id") Long submissionId,
            @RequestBody Map<String, Object> feedbackRequest) {

        try {
            String feedback = (String) feedbackRequest.get("feedback");
            Integer score = null;

            if (feedbackRequest.containsKey("score")) {
                Object scoreObj = feedbackRequest.get("score");
                if (scoreObj != null) {
                    if (scoreObj instanceof Integer) {
                        score = (Integer) scoreObj;
                    } else if (scoreObj instanceof Double) {
                        score = ((Double) scoreObj).intValue();
                    } else if (scoreObj instanceof String) {
                        String scoreStr = ((String) scoreObj).trim();
                        if (!scoreStr.isEmpty()) {
                            try {
                                score = Integer.parseInt(scoreStr);
                            } catch (NumberFormatException e) {
                                return ResponseEntity.badRequest().body(ApiResponse
                                        .error("Invalid score format. Must be an integer.", "INVALID_SCORE"));
                            }
                        } else {
                            score = 0;
                        }
                    } else if (scoreObj instanceof Number) {
                        score = ((Number) scoreObj).intValue();
                    }
                } else {
                    score = 0;
                }
            } else {
                score = 0;
            }

            if (feedback == null || feedback.trim().isEmpty()) {
                feedback = "Đã xem";
            } else {
                feedback = feedback.trim();
            }

            if (score == null) {
                score = 0;
            }

            var result = miniTestService.scoreAndFeedback(submissionId, feedback, score);

            Map<String, Object> response = new HashMap<>();
            response.put("message", result.getMessage());

            if (result.getSubmissionId() != null) {
                response.put("submissionId", result.getSubmissionId());
            }

            if (result.getTestId() != null) {
                response.put("testId", result.getTestId());
            }

            if (result.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success(response));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error(result.getMessage(), "OPERATION_FAILED"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @PostMapping("/submission/{id}/manual-score")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitManualScore(
            @PathVariable(name = "id") Long submissionId,
            @RequestBody Map<String, Object> scoreRequest) {

        try {
            String feedback = (String) scoreRequest.get("feedback");
            Integer totalScore = null;

            if (scoreRequest.containsKey("score")) {
                Object scoreObj = scoreRequest.get("score");
                if (scoreObj != null) {
                    if (scoreObj instanceof Integer) {
                        totalScore = (Integer) scoreObj;
                    } else if (scoreObj instanceof Double) {
                        totalScore = ((Double) scoreObj).intValue();
                    } else if (scoreObj instanceof String) {
                        String scoreStr = ((String) scoreObj).trim();
                        if (!scoreStr.isEmpty()) {
                            try {
                                totalScore = Integer.parseInt(scoreStr);
                            } catch (NumberFormatException e) {
                                return ResponseEntity.badRequest().body(ApiResponse
                                        .error("Invalid score format. Must be an integer.", "INVALID_SCORE"));
                            }
                        } else {
                            totalScore = 0;
                        }
                    } else if (scoreObj instanceof Number) {
                        totalScore = ((Number) scoreObj).intValue();
                    }
                } else {
                    totalScore = 0;
                }
            } else {
                totalScore = 0;
            }

            if (feedback == null || feedback.trim().isEmpty()) {
                feedback = "Đã chấm điểm thủ công";
            } else {
                feedback = feedback.trim();
            }

            if (totalScore == null || totalScore < 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid score", "INVALID_SCORE"));
            }

            var result = miniTestService.scoreAndFeedback(submissionId, feedback, totalScore);

            Map<String, Object> response = new HashMap<>();
            response.put("message", result.getMessage());
            response.put("submissionId", result.getSubmissionId());
            response.put("score", totalScore);

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @GetMapping("/lesson/{lessonId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLessonStats(
            @PathVariable(name = "lessonId") Integer lessonId) {
        try {
            long pendingCount = miniTestService.countPendingByLesson(lessonId);
            long feedbackedCount = miniTestService.countFeedbackedByLesson(lessonId);
            Map<String, Object> statsData = new HashMap<>();
            statsData.put("lessonId", lessonId);
            statsData.put("totalSubmissions", 0);
            statsData.put("pendingCount", pendingCount);
            statsData.put("feedbackedCount", feedbackedCount);

            return ResponseEntity.ok(ApiResponse.success(statsData));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchSubmissions(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "lessonId", required = false) Integer lessonId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        try {
            List<MiniTestSubmissionDTO> allSubmissions = miniTestService.getAllSubmissions();

            List<MiniTestSubmissionDTO> filteredSubmissions = allSubmissions.stream()
                    .filter(submission -> {
                        boolean matches = true;

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

                        if (status != null && !status.isEmpty()) {
                            matches = matches && submission.getStatus().equalsIgnoreCase(status);
                        }

                        if (lessonId != null) {
                            matches = matches && submission.getLessonId().equals(lessonId.longValue());
                        }

                        return matches;
                    })
                    .collect(Collectors.toList());

            int start = Math.min(page * size, filteredSubmissions.size());
            int end = Math.min((page + 1) * size, filteredSubmissions.size());
            List<MiniTestSubmissionDTO> pagedSubmissions = filteredSubmissions.subList(start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("data", pagedSubmissions);
            response.put("currentPage", page);
            response.put("totalItems", filteredSubmissions.size());
            response.put("totalPages", (int) Math.ceil((double) filteredSubmissions.size() / size));

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllAsRead() {
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

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đã đánh dấu " + markedCount + " bài là đã đọc");
            response.put("markedCount", markedCount);

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @DeleteMapping("/submission/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteSubmission(@PathVariable(name = "id") Long id) {
        try {
            var result = miniTestService.deleteSubmissionByAdmin(id);

            Map<String, Object> response = new HashMap<>();
            response.put("message", result.getMessage());

            if (result.getSubmissionId() != null) {
                response.put("submissionId", result.getSubmissionId());
            }

            if (result.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success(response));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error(result.getMessage(), "OPERATION_FAILED"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @PostMapping("/batch-delete")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchDeleteSubmissions(
            @RequestBody Map<String, Object> request) {
        try {
            List<Integer> ids = (List<Integer>) request.get("ids");

            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("ID list cannot be empty", "EMPTY_ID_LIST"));
            }

            List<Long> successIds = new ArrayList<>();
            List<Long> failedIds = new ArrayList<>();
            Map<Long, String> errorMessages = new HashMap<>();

            for (Integer id : ids) {
                try {
                    Long submissionId = id.longValue();
                    var result = miniTestService.deleteSubmissionByAdmin(submissionId);

                    if (result.isSuccess()) {
                        successIds.add(submissionId);
                    } else {
                        failedIds.add(submissionId);
                        errorMessages.put(submissionId, result.getMessage());
                    }
                } catch (Exception e) {
                    Long submissionId = id.longValue();
                    failedIds.add(submissionId);
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "Lỗi không xác định";
                    errorMessages.put(submissionId, errorMsg);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format("Đã xử lý %d bài nộp", ids.size()));
            response.put("total", ids.size());
            response.put("successCount", successIds.size());
            response.put("failedCount", failedIds.size());

            if (!successIds.isEmpty()) {
                response.put("successIds", successIds);
            }

            if (!failedIds.isEmpty()) {
                response.put("failedIds", failedIds);
                response.put("errors", errorMessages);
            }

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (ClassCastException e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Invalid request format. IDs must be an array of integers", "INVALID_REQUEST"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @DeleteMapping("/batch-delete")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchDeleteByQueryParam(
            @RequestParam(name = "ids") List<Long> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("ID list cannot be empty", "EMPTY_ID_LIST"));
            }

            List<Long> successIds = new ArrayList<>();
            List<Long> failedIds = new ArrayList<>();
            Map<Long, String> errorMessages = new HashMap<>();

            for (Long submissionId : ids) {
                try {
                    var result = miniTestService.deleteSubmissionByAdmin(submissionId);

                    if (result.isSuccess()) {
                        successIds.add(submissionId);
                    } else {
                        failedIds.add(submissionId);
                        errorMessages.put(submissionId, result.getMessage());
                    }
                } catch (Exception e) {
                    failedIds.add(submissionId);
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "Lỗi không xác định";
                    errorMessages.put(submissionId, errorMsg);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format("Đã xử lý %d bài nộp", ids.size()));
            response.put("total", ids.size());
            response.put("successCount", successIds.size());
            response.put("failedCount", failedIds.size());

            if (!successIds.isEmpty()) {
                response.put("successIds", successIds);
            }

            if (!failedIds.isEmpty()) {
                response.put("failedIds", failedIds);
                response.put("errors", errorMessages);
            }

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Server error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }

    @GetMapping("/mini-test/max-score/{lessonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMaxScoreForLesson(
            @PathVariable(name = "lessonId") Integer lessonId) {
        try {
            Integer maxScore = grammarQuestionRepository.sumPointsByLessonId(lessonId);
            Long questionCount = grammarQuestionRepository.countByLessonId(lessonId);

            Map<String, Object> response = new HashMap<>();
            response.put("lessonId", lessonId);
            response.put("maxScore", maxScore != null ? maxScore : 0);
            response.put("questionCount", questionCount);
            response.put("averagePointsPerQuestion",
                    questionCount > 0 && maxScore != null ? Math.round((double) maxScore / questionCount) : 10);

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error getting max score: " + e.getMessage(), "SERVER_ERROR"));
        }
    }
}