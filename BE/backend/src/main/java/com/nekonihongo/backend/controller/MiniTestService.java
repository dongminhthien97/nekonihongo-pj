// src/main/java/com/nekonihongo/backend/service/MiniTestService.java (FULL CODE SERVICE HOÀN CHỈNH VỚI CÁC METHOD LESSON STATS MỚI)

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

    public CheckTestResponseDTO checkUserTestStatus(Long userId, Integer lessonId) {
        Optional<MiniTestSubmission> submission = submissionRepository.findByUserIdAndLessonId(userId, lessonId);
        boolean hasSubmitted = submission.isPresent();
        Long submissionId = hasSubmitted ? submission.get().getId() : null;

        return CheckTestResponseDTO.builder()
                .hasSubmitted(hasSubmitted)
                .submissionId(submissionId)
                .build();
    }

    @Transactional
    public SubmitTestResponseDTO submitTest(SubmitTestRequestDTO request) {
        boolean alreadySubmitted = submissionRepository
                .existsByUserIdAndLessonId(request.getUserId(), request.getLessonId());

        if (alreadySubmitted) {
            return SubmitTestResponseDTO.builder()
                    .success(false)
                    .message("Bạn đã nộp bài test này rồi!")
                    .build();
        }

        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(request.getAnswers());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi khi chuyển đổi answers sang JSON", e);
        }

        MiniTestSubmission submission = MiniTestSubmission.builder()
                .userId(request.getUserId())
                .lessonId(request.getLessonId())
                .answers(answersJson)
                .timeSpent(request.getTimeSpent())
                .submittedAt(request.getSubmittedAt() != null ? request.getSubmittedAt() : LocalDateTime.now())
                .status(Status.pending)
                .build();

        MiniTestSubmission savedSubmission = submissionRepository.save(submission);

        log.info("Test submitted by user {} for lesson {}", request.getUserId(), request.getLessonId());

        return SubmitTestResponseDTO.builder()
                .success(true)
                .message("Bài test đã được nộp thành công!")
                .testId(savedSubmission.getId())
                .submissionId(savedSubmission.getId())
                .build();
    }

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
        submission.setStatus(Status.feedbacked);

        submissionRepository.save(submission);

        log.info("Feedback provided for submission {}", submissionId);

        return SubmitTestResponseDTO.builder()
                .success(true)
                .message("Đã gửi feedback thành công")
                .submissionId(submissionId)
                .build();
    }

    // =========== USER METHODS ===========

    public List<MiniTestSubmissionDTO> getUserSubmissions() {
        Long userId = getCurrentUserId();
        List<MiniTestSubmission> entities = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);

        return entities.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public int getUserFeedbackCount() {
        Long userId = getCurrentUserId();
        return (int) submissionRepository.countByUserIdAndStatus(userId, Status.feedbacked);
    }

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

    public long getPendingCount() {
        return submissionRepository.countByStatus(Status.pending);
    }

    public List<MiniTestSubmissionDTO> getPendingSubmissions() {
        List<MiniTestSubmission> submissions = submissionRepository.findByStatusOrderBySubmittedAtDesc(Status.pending);
        return submissions.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public Optional<MiniTestSubmission> getSubmissionById(Long submissionId) {
        return submissionRepository.findById(submissionId);
    }

    // NEW: Thống kê theo lesson cho admin
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

    private MiniTestSubmissionDTO convertToDto(MiniTestSubmission entity) {
        MiniTestSubmissionDTO dto = MiniTestSubmissionDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .lessonId(entity.getLessonId().longValue())
                .submittedAt(entity.getSubmittedAt())
                .feedback(entity.getFeedback())
                .feedbackAt(entity.getFeedbackAt())
                .status(entity.getStatus().name())
                .timeSpent(entity.getTimeSpent()) // Nếu entity có timeSpent
                .build();

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

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Không xác thực được user");
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getId();
        }

        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user từ token: " + username));
            return user.getId();
        }

        if (principal instanceof String username) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user từ token: " + username));
            return user.getId();
        }

        throw new RuntimeException("Loại principal không hỗ trợ: " + principal.getClass().getName());
    }

    // =========== UTILITY METHODS ===========

    public Map<String, Object> parseAnswersFromJson(String answersJson) {
        try {
            if (answersJson == null || answersJson.isEmpty()) {
                return Map.of();
            }
            return objectMapper.readValue(answersJson, new TypeReference<Map<String, Object>>() {
            });
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi khi parse answers JSON", e);
        }
    }

    public List<MiniTestSubmissionDTO.AnswerDTO> parseAnswersToDtoList(String answersJson) {
        try {
            if (answersJson == null || answersJson.isEmpty()) {
                return List.of();
            }
            return objectMapper.readValue(answersJson, new TypeReference<List<MiniTestSubmissionDTO.AnswerDTO>>() {
            });
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi khi parse answers JSON", e);
        }
    }

    public String convertMapToJson(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting map to JSON", e);
        }
    }

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