// src/main/java/com/nekonihongo/backend/service/MiniTestSubmissionService.java (FULL CODE SERVICE VỚI FIX PRINCIPAL ORG.SPRINGFRAMEWORK.SECURITY.CORE.USERDETAILS.USER)

package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.MiniTestSubmissionDTO;
import com.nekonihongo.backend.dto.MiniTestSubmissionDTO.AnswerDTO;
import com.nekonihongo.backend.entity.MiniTestSubmission;
import com.nekonihongo.backend.entity.MiniTestSubmission.Status;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.MiniTestSubmissionRepository;
import com.nekonihongo.backend.repository.UserRepository;
import com.nekonihongo.backend.security.UserPrincipal; // Nếu có custom UserPrincipal

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // ← NEW import cho default User
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MiniTestSubmissionService {

    @Autowired
    private MiniTestSubmissionRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository; // Để load user từ username

    // ADMIN: Đếm số bài pending toàn hệ thống
    public long getPendingCount() {
        return repository.countByStatus(Status.pending);
    }

    // ADMIN: Lấy danh sách pending
    public List<MiniTestSubmission> getPendingSubmissions() {
        return repository.findByStatusOrderBySubmittedAtDesc(Status.pending);
    }

    // USER + ADMIN: Lưu submission mới
    @Transactional
    public MiniTestSubmission submit(MiniTestSubmission submission) {
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(Status.pending);
        return repository.save(submission);
    }

    // ADMIN: Add feedback
    @Transactional
    public MiniTestSubmission addFeedback(Long id, String feedback) {
        MiniTestSubmission submission = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp"));

        submission.setFeedback(feedback);
        submission.setFeedbackAt(LocalDateTime.now());
        submission.setStatus(Status.feedbacked);

        return repository.save(submission);
    }

    // ROBUST getCurrentUserId – hỗ trợ nhiều loại principal phổ biến
    private Long getCurrentUserId() {
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
        // (org.springframework.security.core.userdetails.User)
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

    // USER: Lấy danh sách submissions
    @Transactional(readOnly = true)
    public List<MiniTestSubmissionDTO> getUserSubmissions() {
        Long userId = getCurrentUserId();
        List<MiniTestSubmission> entities = repository.findByUserIdOrderBySubmittedAtDesc(userId);

        return entities.stream().map(entity -> {
            MiniTestSubmissionDTO dto = new MiniTestSubmissionDTO();
            dto.setId(entity.getId());
            dto.setLessonId(entity.getLessonId().longValue());
            dto.setSubmittedAt(entity.getSubmittedAt());
            dto.setFeedback(entity.getFeedback());
            dto.setFeedbackAt(entity.getFeedbackAt());
            dto.setStatus(entity.getStatus().name());

            try {
                if (entity.getAnswers() != null && !entity.getAnswers().isEmpty()) {
                    List<AnswerDTO> answers = objectMapper.readValue(
                            entity.getAnswers(),
                            new TypeReference<List<AnswerDTO>>() {
                            });
                    dto.setAnswers(answers);
                } else {
                    dto.setAnswers(List.of());
                }
            } catch (JsonProcessingException e) {
                dto.setAnswers(List.of());
            }

            return dto;
        }).collect(Collectors.toList());
    }

    // USER: Xóa submission
    @Transactional
    public void deleteUserSubmission(Long submissionId) {
        Long userId = getCurrentUserId();
        MiniTestSubmission entity = repository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp"));

        if (!entity.getUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền xóa bài nộp này");
        }

        repository.delete(entity);
    }

    // USER: Đếm số bài đã feedback
    public int getUserFeedbackCount() {
        Long userId = getCurrentUserId();
        return (int) repository.countByUserIdAndStatus(userId, Status.feedbacked);
    }
}