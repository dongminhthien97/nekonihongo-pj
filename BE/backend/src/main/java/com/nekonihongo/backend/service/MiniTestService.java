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
     */
    private List<MiniTestSubmissionDTO.AnswerDTO> parseAnswersJson(String answersJson) {
        List<MiniTestSubmissionDTO.AnswerDTO> answers = new ArrayList<>();

        if (answersJson == null || answersJson.trim().isEmpty()) {
            return answers;
        }

        try {
            JsonNode rootNode = objectMapper.readTree(answersJson);

            if (rootNode.isArray()) {
                // Format: [{"question_id":1,"user_answer":"A"},...]
                for (JsonNode node : rootNode) {
                    // Chuyển đổi int sang Long
                    Long questionId = node.get("question_id").asLong();
                    if (questionId == null) {
                        questionId = (long) node.get("question_id").asInt();
                    }

                    MiniTestSubmissionDTO.AnswerDTO answerDTO = MiniTestSubmissionDTO.AnswerDTO.builder()
                            .questionId(questionId)
                            .userAnswer(node.get("user_answer").asText())
                            .build();
                    answers.add(answerDTO);
                }
            } else if (rootNode.isObject()) {
                // Format: {"1":{"question_id":1,"user_answer":"A"},...}
                // Hoặc: {"question_1":{"question_id":1,"user_answer":"A"},...}
                Iterator<Map.Entry<String, JsonNode>> fields = rootNode.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    JsonNode answerNode = entry.getValue();

                    // Kiểm tra xem node có chứa question_id và user_answer không
                    if (answerNode.has("question_id") && answerNode.has("user_answer")) {
                        // Chuyển đổi int sang Long
                        Long questionId = answerNode.get("question_id").asLong();
                        if (questionId == null) {
                            questionId = (long) answerNode.get("question_id").asInt();
                        }

                        MiniTestSubmissionDTO.AnswerDTO answerDTO = MiniTestSubmissionDTO.AnswerDTO.builder()
                                .questionId(questionId)
                                .userAnswer(answerNode.get("user_answer").asText())
                                .build();
                        answers.add(answerDTO);
                    } else if (answerNode.isObject()) {
                        // Nếu không có các field chuẩn, thử parse các field khác
                        Iterator<String> fieldNames = answerNode.fieldNames();
                        while (fieldNames.hasNext()) {
                            String fieldName = fieldNames.next();
                            JsonNode fieldValue = answerNode.get(fieldName);
                            if (fieldValue.isTextual()) {
                                // Cố gắng parse questionId từ field name
                                try {
                                    String cleanFieldName = fieldName
                                            .replace("question_", "")
                                            .replace("q", "");
                                    Long questionId = Long.parseLong(cleanFieldName);

                                    MiniTestSubmissionDTO.AnswerDTO answerDTO = MiniTestSubmissionDTO.AnswerDTO
                                            .builder()
                                            .questionId(questionId)
                                            .userAnswer(fieldValue.asText())
                                            .build();
                                    answers.add(answerDTO);
                                } catch (NumberFormatException e) {
                                    log.warn("Cannot parse questionId from field name: {}", fieldName);
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing answers JSON: {}", answersJson, e);
            // Nếu parse lỗi, thử parse như mảng trước khi throw
            try {
                // Thử parse như mảng thông thường
                return objectMapper.readValue(answersJson,
                        new TypeReference<List<MiniTestSubmissionDTO.AnswerDTO>>() {
                        });
            } catch (JsonProcessingException ex) {
                log.error("Fallback parsing also failed for: {}", answersJson);
                // Không throw exception, trả về list rỗng
                return List.of();
            }
        }

        // Sắp xếp theo questionId để hiển thị đúng thứ tự
        answers.sort(Comparator.comparing(MiniTestSubmissionDTO.AnswerDTO::getQuestionId));

        return answers;
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
                JsonNode node = objectMapper.readTree(sub.getAnswers());
                log.info("Submission ID: {}, User: {}, Lesson: {}, Status: {}",
                        sub.getId(), sub.getUserId(), sub.getLessonId(), sub.getStatus());
                log.info("  JSON Type: isArray={}, isObject={}", node.isArray(), node.isObject());
                log.info("  Answers preview: {}",
                        sub.getAnswers().length() > 100 ? sub.getAnswers().substring(0, 100) + "..."
                                : sub.getAnswers());

                // Thử parse bằng method mới
                List<MiniTestSubmissionDTO.AnswerDTO> parsed = parseAnswersJson(sub.getAnswers());
                log.info("  Parsed answers count: {}", parsed.size());

            } catch (Exception e) {
                log.error("  Error parsing submission {}: {}", sub.getId(), e.getMessage());
            }
        }
        log.info("=== END DEBUG ===");
    }
}