package com.nekonihongo.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "grammar_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@ToString
public class GrammarQuestion {

    public enum QuestionType {
        fill_blank,
        multiple_choice,
        rearrange
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Integer lessonId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> options;

    @Column(name = "correct_answer", nullable = false, length = 255)
    private String correctAnswer;

    @Column
    @Builder.Default
    private Integer points = 10;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationship with GrammarLesson
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", insertable = false, updatable = false)
    @ToString.Exclude
    private GrammarLesson lesson;
}