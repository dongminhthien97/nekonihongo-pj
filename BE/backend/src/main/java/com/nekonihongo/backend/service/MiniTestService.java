// src/main/java/com/nekonihongo/backend/service/MiniTestService.java (FULL CODE SERVICE HOÀN CHỈNH VỚI CÁC METHOD MỚI CHO ADMIN LESSON STATS)

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
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    // NEW: Lấy tất cả submissions (cho filter=all)
    public List<MiniTestSubmissionDTO> getAllSubmissions() {
        List<MiniTestSubmission> all = submissionRepository.findAllByOrderBySubmittedAtDesc();
        return all.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Kiểm tra user đã submit bài test cho lesson chưa
     */
    public CheckTestResponseDTO checkUserTestStatus(Long userId, Integer lessonId) {
        Optional<MiniTestSubmission> submission = submissionRepository.findByUserIdAndLessonId(userId, lessonId);
        boolean hasSubmitted = submission.isPresent();
        Long submissionId = hasSubmitted ? submission.get().getId() : null;

        return CheckTestResponseDTO.builder()
                .hasSubmitted(hasSubmitted)
                .submissionId(submissionId)
                .build();
    }

    /**
     * Submit bài test mới
     */
    @Transactional
    public SubmitTestResponseDTO submitTest(SubmitTestRequestDTO request) {
        // Kiểm tra user đã nộp bài chưa
        boolean alreadySubmitted = submissionRepository
                .existsByUserIdAndLessonId(request.getUserId(), request.getLessonId());

        if (alreadySubmitted) {
            return SubmitTestResponseDTO.builder()
                    .success(false)
                    .message("Bạn đã nộp bài test này rồi!")
                    .build();
        }

        // Chuyển đổi answers từ Map sang JSON string
        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(request.getAnswers());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi khi chuyển đổi answers sang JSON", e);
        }

        // Tạo submission mới với builder pattern
        MiniTestSubmission submission = MiniTestSubmission.builder()
                .userId(request.getUserId())
                .lessonId(request.getLessonId())
                .answers(answersJson) // Đây là String JSON
                .timeSpent(request.getTimeSpent())
                .submittedAt(request.getSubmittedAt() != null ? request.getSubmittedAt() : LocalDateTime.now())
                .status(MiniTestSubmission.Status.pending)
                .build();

        MiniTestSubmission savedSubmission = submissionRepository.save(submission);

        log.info("Test submitted by user {} for lesson {}",
                request.getUserId(), request.getLessonId());

        return SubmitTestResponseDTO.builder()
                .success(true)
                .message("Bài test đã được nộp thành công!")
                .testId(savedSubmission.getId())
                .submissionId(savedSubmission.getId())
                .build();
    }

    /**
     * Admin thêm feedback cho bài test
     */
    @Transactional
    public SubmitTestResponseDTO provideFeedback(Long submissionId, String feedback) {
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
        submission.setStatus(MiniTestSubmission.Status.feedbacked);

        submissionRepository.save(submission);

        log.info("Feedback provided for submission {}", submissionId);

        return SubmitTestResponseDTO.builder()
                .success(true)
                .message("Đã gửi feedback thành công")
                .submissionId(submissionId)
                .build();
    }

    // =========== USER METHODS ===========

    /**
     * Lấy danh sách submissions của user hiện tại
     */
    public List<MiniTestSubmissionDTO> getUserSubmissions() {
        Long userId = getCurrentUserId();
        List<MiniTestSubmission> entities = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);

        return entities.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Đếm số bài đã feedback của user hiện tại
     */
    public int getUserFeedbackCount() {
        Long userId = getCurrentUserId();
        return (int) submissionRepository.countByUserIdAndStatus(userId, Status.feedbacked);
    }

    /**
     * Xóa submission của user hiện tại
     */
    @Transactional
    public void deleteUserSubmission(Long submissionId) {
        Long userId = getCurrentUserId();
        MiniTestSubmission entity = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp"));

        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền xóa bài nộp này");
        }

        submissionRepository.delete(entity);
        log.info("User {} deleted submission {}", userId, submissionId);
    }

    // =========== ADMIN METHODS ===========

    /**
     * Đếm số bài pending toàn hệ thống
     */
    public long getPendingCount() {
        return submissionRepository.countByStatus(Status.pending);
    }

    /**
     * Lấy danh sách bài pending (admin)
     */
    public List<MiniTestSubmissionDTO> getPendingSubmissions() {
        List<MiniTestSubmission> submissions = submissionRepository.findByStatusOrderBySubmittedAtDesc(Status.pending);
        return submissions.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Lấy bài nộp theo ID
     */
    public Optional<MiniTestSubmission> getSubmissionById(Long submissionId) {
        return submissionRepository.findById(submissionId);
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
     * Convert entity to DTO
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
                List<MiniTestSubmissionDTO.AnswerDTO> answers = objectMapper.readValue(
                        entity.getAnswers(),
                        new TypeReference<List<MiniTestSubmissionDTO.AnswerDTO>>() {
                        });
                dto.setAnswers(answers);
            } else {
                dto.setAnswers(List.of());
            }
        } catch (JsonProcessingException e) {
            log.error("Error parsing answers JSON for submission {}", entity.getId(), e);
            dto.setAnswers(List.of());
        }

        return dto;
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
        try {
            if (answersJson == null || answersJson.isEmpty()) {
                return List.of();
            }
            return objectMapper.readValue(answersJson,
                    new TypeReference<List<MiniTestSubmissionDTO.AnswerDTO>>() {
                    });
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi khi parse answers JSON", e);
        }
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
}