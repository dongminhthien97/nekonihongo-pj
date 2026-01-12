// src/main/java/com/nekonihongo/backend/entity/MiniTestSubmission.java (fixed với lesson_id INT)
package com.nekonihongo.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mini_test_submissions")
public class MiniTestSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId; // BIGINT (khớp users.id)

    // FIXED: lesson_id là INT (khớp grammar_lessons.id int AI PK)
    @Column(name = "lesson_id", nullable = false)
    private Integer lessonId; // Đổi từ Long sang Integer

    @Column(columnDefinition = "JSON", nullable = false)
    private String answers;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "feedback_at")
    private LocalDateTime feedbackAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('pending', 'feedbacked') DEFAULT 'pending'")
    private Status status = Status.pending;

    public enum Status {
        pending,
        feedbacked
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getLessonId() {
        return lessonId;
    }

    public void setLessonId(Integer lessonId) {
        this.lessonId = lessonId;
    }

    public String getAnswers() {
        return answers;
    }

    public void setAnswers(String answers) {
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}