// src/main/java/com/nekonihongo/backend/dto/MiniTestSubmissionDTO.java (FULL CODE DTO HOÀN CHỈNH)

package com.nekonihongo.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class MiniTestSubmissionDTO {

    private Long id;

    private Long lessonId;

    private String lessonTitle; // Có thể join từ grammar_lessons hoặc fetch riêng

    private List<AnswerDTO> answers;

    private LocalDateTime submittedAt;

    private String feedback;

    private LocalDateTime feedbackAt;

    private String status; // "pending" or "feedbacked"

    // Inner DTO cho mỗi câu trả lời
    public static class AnswerDTO {
        private Long questionId;
        private String userAnswer;

        // Constructors
        public AnswerDTO() {
        }

        public AnswerDTO(Long questionId, String userAnswer) {
            this.questionId = questionId;
            this.userAnswer = userAnswer;
        }

        // Getters and Setters
        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public String getUserAnswer() {
            return userAnswer;
        }

        public void setUserAnswer(String userAnswer) {
            this.userAnswer = userAnswer;
        }
    }

    // Constructors
    public MiniTestSubmissionDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public String getLessonTitle() {
        return lessonTitle;
    }

    public void setLessonTitle(String lessonTitle) {
        this.lessonTitle = lessonTitle;
    }

    public List<AnswerDTO> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerDTO> answers) {
        this.answers = answers;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getFeedbackAt() {
        return feedbackAt;
    }

    public void setFeedbackAt(LocalDateTime feedbackAt) {
        this.feedbackAt = feedbackAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Optional: toString() cho debug
    @Override
    public String toString() {
        return "MiniTestSubmissionDTO{" +
                "id=" + id +
                ", lessonId=" + lessonId +
                ", lessonTitle='" + lessonTitle + '\'' +
                ", answers=" + answers +
                ", submittedAt=" + submittedAt +
                ", feedback='" + feedback + '\'' +
                ", feedbackAt=" + feedbackAt +
                ", status='" + status + '\'' +
                '}';
    }
}