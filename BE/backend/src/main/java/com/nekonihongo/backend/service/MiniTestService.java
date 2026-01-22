// src/main/java/com/nekonihongo/backend/service/MiniTestService.java

package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.*;
import com.nekonihongo.backend.entity.MiniTestSubmission;
import com.nekonihongo.backend.entity.MiniTestSubmission.Status;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.MiniTestSubmissionRepository;
import com.nekonihongo.backend.repository.UserRepository;
import com.nekonihongo.backend.security.UserPrincipal;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MiniTestService {

    private final MiniTestSubmissionRepository submissionRepository;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    // =========== FRONTEND API METHODS ===========

    public List<MiniTestSubmissionDTO> getAllSubmissions() {
        List<MiniTestSubmission> all = submissionRepository.findAllByOrderBySubmittedAtDesc();
        return all.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Kiểm tra user đã submit bài test cho lesson chưa
     * Chỉ để hiển thị thông tin, không dùng để chặn submit
     */
    public CheckTestResponseDTO checkUserTestStatus(Long userId, Integer lessonId) {
        List<MiniTestSubmission> submissions = submissionRepository
                .findByUserIdAndLessonIdOrderBySubmittedAtDesc(userId, lessonId);
        boolean hasSubmitted = !submissions.isEmpty();
        Long submissionId = hasSubmitted ? submissions.get(0).getId() : null;

        return CheckTestResponseDTO.builder()
                .hasSubmitted(hasSubmitted)
                .submissionId(submissionId)
                .build();
    }

    /**
     * Submit bài test mới - LUÔN TẠO RECORD MỚI (cho phép submit nhiều lần)
     */
    @Transactional
    public SubmitTestResponseDTO submitTest(SubmitTestRequestDTO request) {
        try {
            // Validate input
            if (request.getUserId() == null) {
                return SubmitTestResponseDTO.builder()
                        .success(false)
                        .message("User ID không được để trống")
                        .build();
            }

            if (request.getLessonId() == null) {
                return SubmitTestResponseDTO.builder()
                        .success(false)
                        .message("Lesson ID không được để trống")
                        .build();
            }

            // Debug log
            log.info("Submitting test for user {} lesson {} with {} answers",
                    request.getUserId(), request.getLessonId(),
                    request.getAnswers() != null ? request.getAnswers().size() : 0);

            // Chuyển đổi answers từ Map sang JSON string
            String answersJson;
            try {
                // Debug: Kiểm tra cấu trúc của answers trước khi convert
                if (request.getAnswers() != null) {
                    log.debug("Answers structure: {}", request.getAnswers().getClass().getName());
                    log.debug("Answers content (first 3): {}",
                            request.getAnswers().entrySet().stream()
                                    .limit(3)
                                    .map(e -> e.getKey() + "=" + e.getValue())
                                    .collect(Collectors.joining(", ")));
                }

                answersJson = objectMapper.writeValueAsString(request.getAnswers());
                log.debug("Answers JSON: {}", answersJson);
            } catch (JsonProcessingException e) {
                log.error("Error converting answers to JSON", e);
                return SubmitTestResponseDTO.builder()
                        .success(false)
                        .message("Lỗi khi xử lý câu trả lời: " + e.getMessage())
                        .build();
            }

            // Tạo submission mới - LUÔN TẠO MỚI (CHO PHÉP SUBMIT NHIỀU LẦN)
            MiniTestSubmission submission = MiniTestSubmission.builder()
                    .userId(request.getUserId())
                    .lessonId(request.getLessonId())
                    .answers(answersJson)
                    .timeSpent(request.getTimeSpent() != null ? request.getTimeSpent() : 0)
                    .submittedAt(request.getSubmittedAt() != null ? request.getSubmittedAt() : LocalDateTime.now())
                    .status(Status.pending) // Sử dụng status.pending từ entity
                    .feedback(null)
                    .feedbackAt(null)
                    .build();

            MiniTestSubmission savedSubmission = submissionRepository.save(submission);

            log.info("Test submitted successfully: submissionId={}, userId={}, lessonId={}, timeSpent={}s",
                    savedSubmission.getId(), request.getUserId(), request.getLessonId(),
                    request.getTimeSpent());

            return SubmitTestResponseDTO.builder()
                    .success(true)
                    .message("Bài test đã được nộp thành công!")
                    .testId(savedSubmission.getId())
                    .submissionId(savedSubmission.getId())
                    .build();

        } catch (Exception e) {
            log.error("Error submitting test for user {} lesson {}",
                    request.getUserId(), request.getLessonId(), e);
            return SubmitTestResponseDTO.builder()
                    .success(false)
                    .message("Lỗi hệ thống khi nộp bài: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Admin thêm feedback cho bài test
     */
    @Transactional
    public SubmitTestResponseDTO provideFeedback(Long submissionId, String feedback) {
        try {
            Optional<MiniTestSubmission> submissionOpt = submissionRepository.findById(submissionId);

            if (submissionOpt.isEmpty()) {
                return SubmitTestResponseDTO.builder()
                        .success(false)
                        .message("Không tìm thấy bài nộp")
                        .build();
            }

            MiniTestSubmission submission = submissionOpt.get();
            submission.setFeedback(feedback);
            submission.setFeedbackAt(LocalDateTime.now());
            submission.setStatus(Status.feedbacked); // Sử dụng status.feedbacked từ entity

            submissionRepository.save(submission);

            log.info("Feedback provided for submission {}", submissionId);

            return SubmitTestResponseDTO.builder()
                    .success(true)
                    .message("Đã gửi feedback thành công")
                    .submissionId(submissionId)
                    .build();
        } catch (Exception e) {
            log.error("Error providing feedback for submission {}", submissionId, e);
            return SubmitTestResponseDTO.builder()
                    .success(false)
                    .message("Lỗi khi gửi feedback: " + e.getMessage())
                    .build();
        }
    }

    // =========== USER METHODS ===========

    /**
     * Lấy danh sách submissions của user hiện tại
     */
    public List<MiniTestSubmissionDTO> getUserSubmissions() {
        try {
            Long userId = getCurrentUserId();
            log.debug("Getting submissions for user {}", userId);

            List<MiniTestSubmission> entities = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);

            log.debug("Found {} submissions for user {}", entities.size(), userId);

            // Debug: Kiểm tra dữ liệu JSON trong database
            for (MiniTestSubmission entity : entities) {
                try {
                    JsonNode node = objectMapper.readTree(entity.getAnswers());
                    log.debug("Submission {}: isArray={}, isObject={}, answers={}",
                            entity.getId(), node.isArray(), node.isObject(),
                            entity.getAnswers().length() > 100 ? entity.getAnswers().substring(0, 100) + "..."
                                    : entity.getAnswers());
                } catch (Exception e) {
                    log.debug("Submission {}: Error parsing answers: {}", entity.getId(), e.getMessage());
                }
            }

            return entities.stream().map(this::convertToDto).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting user submissions", e);
            return List.of();
        }
    }

    /**
     * Đếm số bài đã feedback của user hiện tại
     */
    public int getUserFeedbackCount() {
        try {
            Long userId = getCurrentUserId();
            return (int) submissionRepository.countByUserIdAndStatus(userId, Status.feedbacked);
        } catch (Exception e) {
            log.error("Error counting user feedback", e);
            return 0;
        }
    }

    /**
     * Xóa submission của user hiện tại
     */
    @Transactional
    public SubmitTestResponseDTO deleteUserSubmission(Long submissionId) {
        try {
            Long userId = getCurrentUserId();
            MiniTestSubmission entity = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp"));

            if (!entity.getUserId().equals(userId)) {
                return SubmitTestResponseDTO.builder()
                        .success(false)
                        .message("Không có quyền xóa bài nộp này")
                        .build();
            }

            submissionRepository.delete(entity);
            log.info("User {} deleted submission {}", userId, submissionId);

            return SubmitTestResponseDTO.builder()
                    .success(true)
                    .message("Đã xóa bài nộp thành công")
                    .submissionId(submissionId)
                    .build();
        } catch (Exception e) {
            log.error("Error deleting submission {}", submissionId, e);
            return SubmitTestResponseDTO.builder()
                    .success(false)
                    .message("Lỗi khi xóa bài nộp: " + e.getMessage())
                    .build();
        }
    }

    // =========== ADMIN METHODS ===========

    /**
     * Đếm số bài pending toàn hệ thống
     */
    public long getPendingCount() {
        try {
            return submissionRepository.countByStatus(Status.pending);
        } catch (Exception e) {
            log.error("Error counting pending submissions", e);
            return 0;
        }
    }

    /**
     * Lấy danh sách bài pending (admin)
     */
    public List<MiniTestSubmissionDTO> getPendingSubmissions() {
        try {
            List<MiniTestSubmission> submissions = submissionRepository
                    .findByStatusOrderBySubmittedAtDesc(Status.pending);
            return submissions.stream().map(this::convertToDto).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting pending submissions", e);
            return List.of();
        }
    }

    /**
     * Lấy bài nộp theo ID
     */
    public Optional<MiniTestSubmission> getSubmissionById(Long submissionId) {
        try {
            return submissionRepository.findById(submissionId);
        } catch (Exception e) {
            log.error("Error getting submission by ID {}", submissionId, e);
            return Optional.empty();
        }
    }

    // NEW: Thống kê bài nộp theo lesson (cho admin)
    public long countPendingByLesson(Integer lessonId) {
        return submissionRepository.countPendingByLessonId(lessonId);
    }

    public long countFeedbackedByLesson(Integer lessonId) {
        return submissionRepository.countFeedbackedByLessonId(lessonId);
    }

    public List<MiniTestSubmission> getSubmissionsByLesson(Integer lessonId) {
        return submissionRepository.findByLessonId(lessonId);
    }

    // =========== HELPER METHODS ===========

    /**
     * Convert entity to DTO - Xử lý cả JSON array và object
     */
    private MiniTestSubmissionDTO convertToDto(MiniTestSubmission entity) {
        MiniTestSubmissionDTO dto = MiniTestSubmissionDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .lessonId(entity.getLessonId().longValue())
                .submittedAt(entity.getSubmittedAt())
                .feedback(entity.getFeedback())
                .feedbackAt(entity.getFeedbackAt())
                .status(entity.getStatus().name())
                .build();

        // Parse answers từ JSON string sang List<AnswerDTO>
        try {
            if (entity.getAnswers() != null && !entity.getAnswers().isEmpty()) {
                List<MiniTestSubmissionDTO.AnswerDTO> answers = parseAnswersJson(entity.getAnswers());
                dto.setAnswers(answers);
            } else {
                dto.setAnswers(List.of());
            }
        } catch (Exception e) {
            log.error("Error parsing answers JSON for submission {}", entity.getId(), e);
            dto.setAnswers(List.of());
        }

        return dto;
    }

    /**
     * Parse answers từ JSON string - Xử lý cả array và object format
     * FIXED VERSION: Xử lý nhiều format JSON khác nhau
     */
    private List<MiniTestSubmissionDTO.AnswerDTO> parseAnswersJson(String answersJson) {
        List<MiniTestSubmissionDTO.AnswerDTO> answers = new ArrayList<>();

        if (answersJson == null || answersJson.trim().isEmpty()) {
            log.debug("Answers JSON is null or empty");
            return answers;
        }

        try {
            log.debug("Parsing answers JSON (first 200 chars): {}",
                    answersJson.length() > 200 ? answersJson.substring(0, 200) + "..." : answersJson);

            JsonNode rootNode = objectMapper.readTree(answersJson);

            log.debug("JSON Node Type - isArray: {}, isObject: {}, size: {}",
                    rootNode.isArray(), rootNode.isObject(), rootNode.size());

            if (rootNode.isArray()) {
                // Format 1: [{"question_id":1,"user_answer":"A"},...]
                // Format 2: [{"questionId":1,"userAnswer":"A"},...]
                log.debug("Detected ARRAY format");
                parseArrayFormat(rootNode, answers);

            } else if (rootNode.isObject()) {
                // Format 3: {"1":{"question_id":1,"user_answer":"A"},...}
                // Format 4: {"1":"A","2":"B"} (simple key-value)
                // Format 5: {"question_1":"A","question_2":"B"}
                // Format 6: {"q1":"A","q2":"B"}
                log.debug("Detected OBJECT format");
                parseObjectFormat(rootNode, answers);

            } else {
                log.warn("Unknown JSON format - neither array nor object");
            }

        } catch (Exception e) {
            log.error("Error parsing answers JSON: {}", e.getMessage());
            log.debug("Full error stack:", e);

            // Fallback: Thử parse như mảng thông thường
            try {
                log.debug("Trying fallback array parsing");
                List<MiniTestSubmissionDTO.AnswerDTO> fallbackAnswers = objectMapper.readValue(
                        answersJson,
                        new TypeReference<List<MiniTestSubmissionDTO.AnswerDTO>>() {
                        });
                answers.addAll(fallbackAnswers);
                log.debug("Fallback parsing successful, found {} answers", fallbackAnswers.size());
            } catch (JsonProcessingException ex) {
                log.error("Fallback parsing also failed: {}", ex.getMessage());
            }
        }

        // Sắp xếp theo questionId để hiển thị đúng thứ tự
        answers.sort(Comparator.comparing(MiniTestSubmissionDTO.AnswerDTO::getQuestionId));

        log.debug("Successfully parsed {} answers", answers.size());
        if (!answers.isEmpty()) {
            log.debug("Sample answer: questionId={}, answer={}",
                    answers.get(0).getQuestionId(), answers.get(0).getUserAnswer());
        }

        return answers;
    }

    /**
     * Parse array format JSON
     */
    private void parseArrayFormat(JsonNode arrayNode, List<MiniTestSubmissionDTO.AnswerDTO> answers) {
        for (JsonNode node : arrayNode) {
            try {
                Long questionId = extractQuestionId(node);
                String userAnswer = extractUserAnswer(node);

                if (questionId != null && userAnswer != null) {
                    MiniTestSubmissionDTO.AnswerDTO answerDTO = MiniTestSubmissionDTO.AnswerDTO.builder()
                            .questionId(questionId)
                            .userAnswer(userAnswer)
                            .build();
                    answers.add(answerDTO);
                } else {
                    log.warn("Could not extract questionId or userAnswer from array node: {}", node);
                }
            } catch (Exception e) {
                log.warn("Error processing array node: {}", e.getMessage());
            }
        }
    }

    /**
     * Parse object format JSON
     */
    private void parseObjectFormat(JsonNode objectNode, List<MiniTestSubmissionDTO.AnswerDTO> answers) {
        Iterator<Map.Entry<String, JsonNode>> fields = objectNode.fields();

        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String key = entry.getKey();
            JsonNode valueNode = entry.getValue();

            try {
                if (valueNode.isObject()) {
                    // Format: {"1":{"question_id":1,"user_answer":"A"}}
                    Long questionId = extractQuestionIdFromKey(key, valueNode);
                    String userAnswer = extractUserAnswer(valueNode);

                    if (questionId == null) {
                        questionId = extractQuestionId(valueNode);
                    }

                    if (questionId != null && userAnswer != null) {
                        MiniTestSubmissionDTO.AnswerDTO answerDTO = MiniTestSubmissionDTO.AnswerDTO.builder()
                                .questionId(questionId)
                                .userAnswer(userAnswer)
                                .build();
                        answers.add(answerDTO);
                    }

                } else if (valueNode.isTextual() || valueNode.isNumber() || valueNode.isBoolean()) {
                    // Format: {"1":"A"} hoặc {"question_1":"A"}
                    Long questionId = extractQuestionIdFromKey(key, null);
                    String userAnswer = valueNode.asText();

                    if (userAnswer == null || userAnswer.isEmpty()) {
                        userAnswer = String.valueOf(valueNode.asText());
                    }

                    if (questionId != null) {
                        MiniTestSubmissionDTO.AnswerDTO answerDTO = MiniTestSubmissionDTO.AnswerDTO.builder()
                                .questionId(questionId)
                                .userAnswer(userAnswer)
                                .build();
                        answers.add(answerDTO);
                    }
                }
            } catch (Exception e) {
                log.warn("Error processing object field key='{}': {}", key, e.getMessage());
            }
        }
    }

    /**
     * Extract question ID từ JSON node
     */
    private Long extractQuestionId(JsonNode node) {
        if (node == null)
            return null;

        // Thử các field name khác nhau
        if (node.has("question_id") && !node.get("question_id").isNull()) {
            return node.get("question_id").asLong();
        }
        if (node.has("questionId") && !node.get("questionId").isNull()) {
            return node.get("questionId").asLong();
        }
        if (node.has("id") && !node.get("id").isNull()) {
            return node.get("id").asLong();
        }
        if (node.has("qid") && !node.get("qid").isNull()) {
            return node.get("qid").asLong();
        }
        if (node.has("question") && !node.get("question").isNull()) {
            return node.get("question").asLong();
        }

        return null;
    }

    /**
     * Extract user answer từ JSON node
     */
    private String extractUserAnswer(JsonNode node) {
        if (node == null)
            return null;

        // Thử các field name khác nhau
        if (node.has("user_answer") && !node.get("user_answer").isNull()) {
            return node.get("user_answer").asText();
        }
        if (node.has("userAnswer") && !node.get("userAnswer").isNull()) {
            return node.get("userAnswer").asText();
        }
        if (node.has("answer") && !node.get("answer").isNull()) {
            return node.get("answer").asText();
        }
        if (node.has("value") && !node.get("value").isNull()) {
            return node.get("value").asText();
        }
        if (node.has("text") && !node.get("text").isNull()) {
            return node.get("text").asText();
        }

        // Nếu node là primitive value, trả về giá trị đó
        if (node.isTextual()) {
            return node.asText();
        }
        if (node.isNumber()) {
            return String.valueOf(node.asLong());
        }
        if (node.isBoolean()) {
            return String.valueOf(node.asBoolean());
        }

        return null;
    }

    /**
     * Extract question ID từ key (string) và optional value node
     */
    private Long extractQuestionIdFromKey(String key, JsonNode valueNode) {
        try {
            // Loại bỏ các prefix phổ biến
            String cleanKey = key.toLowerCase()
                    .replace("question_", "")
                    .replace("question", "")
                    .replace("q", "")
                    .replace("item_", "")
                    .replace("item", "")
                    .replace("_", "")
                    .trim();

            // Nếu cleanKey là số
            if (cleanKey.matches("\\d+")) {
                return Long.parseLong(cleanKey);
            }

            // Nếu không phải số, thử parse phần số
            String[] parts = cleanKey.split("[^\\d]+");
            for (String part : parts) {
                if (!part.isEmpty() && part.matches("\\d+")) {
                    return Long.parseLong(part);
                }
            }

            // Nếu có valueNode, thử extract từ đó
            if (valueNode != null) {
                Long questionId = extractQuestionId(valueNode);
                if (questionId != null) {
                    return questionId;
                }
            }

            // Fallback: thử parse key trực tiếp
            try {
                return Long.parseLong(key);
            } catch (NumberFormatException e2) {
                // Nếu key không phải số, trả về null
                return null;
            }

        } catch (Exception e) {
            log.warn("Failed to extract questionId from key '{}': {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy userId từ authentication
     */
    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Không xác thực được user");
        }

        Object principal = auth.getPrincipal();

        // Case 1: Custom UserPrincipal
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getId();
        }

        // Case 2: Default Spring Security UserDetails
        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user từ token: " + username));
            return user.getId();
        }

        // Case 3: Principal là String (username)
        if (principal instanceof String username) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user từ token: " + username));
            return user.getId();
        }

        throw new RuntimeException("Loại principal không hỗ trợ: " + principal.getClass().getName());
    }

    // =========== UTILITY METHODS ===========

    /**
     * Parse answers từ JSON string sang Map
     */
    public Map<String, Object> parseAnswersFromJson(String answersJson) {
        try {
            if (answersJson == null || answersJson.isEmpty()) {
                return Map.of();
            }
            return objectMapper.readValue(answersJson,
                    new TypeReference<Map<String, Object>>() {
                    });
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi khi parse answers JSON", e);
        }
    }

    /**
     * Parse answers từ JSON string sang List<AnswerDTO>
     */
    public List<MiniTestSubmissionDTO.AnswerDTO> parseAnswersToDtoList(String answersJson) {
        return parseAnswersJson(answersJson); // Sử dụng method helper mới
    }

    /**
     * Convert Map to JSON String
     */
    public String convertMapToJson(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting map to JSON", e);
        }
    }

    /**
     * Convert JSON String to Map
     */
    public Map<String, Object> convertJsonToMap(String json) {
        try {
            if (json == null || json.isEmpty()) {
                return Map.of();
            }
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting JSON to map", e);
        }
    }

    /**
     * Debug method: Kiểm tra tất cả submissions trong database
     */
    public void debugAllSubmissions() {
        List<MiniTestSubmission> allSubmissions = submissionRepository.findAll();
        log.info("=== DEBUG ALL SUBMISSIONS ===");
        log.info("Total submissions: {}", allSubmissions.size());

        for (MiniTestSubmission sub : allSubmissions) {
            try {
                log.info("Submission ID: {}, User: {}, Lesson: {}, Status: {}",
                        sub.getId(), sub.getUserId(), sub.getLessonId(), sub.getStatus());

                if (sub.getAnswers() != null && !sub.getAnswers().isEmpty()) {
                    try {
                        JsonNode node = objectMapper.readTree(sub.getAnswers());
                        log.info("  JSON Type: isArray={}, isObject={}, size={}",
                                node.isArray(), node.isObject(), node.size());

                        // Hiển thị preview
                        String preview = sub.getAnswers().length() > 200
                                ? sub.getAnswers().substring(0, 200) + "..."
                                : sub.getAnswers();
                        log.info("  Preview: {}", preview);

                        // Thử parse bằng method mới
                        List<MiniTestSubmissionDTO.AnswerDTO> parsed = parseAnswersJson(sub.getAnswers());
                        log.info("  Parsed answers count: {}", parsed.size());

                        if (!parsed.isEmpty()) {
                            log.info("  Sample parsed answer: questionId={}, answer={}",
                                    parsed.get(0).getQuestionId(), parsed.get(0).getUserAnswer());
                        }

                    } catch (Exception e) {
                        log.error("  Error parsing JSON: {}", e.getMessage());
                        log.info("  Raw answers: {}", sub.getAnswers());
                    }
                } else {
                    log.info("  No answers data");
                }

            } catch (Exception e) {
                log.error("  Error processing submission {}: {}", sub.getId(), e.getMessage());
            }
        }
        log.info("=== END DEBUG ===");
    }
}