// src/main/java/com/nekonihongo/backend/entity/Exercise.java
package com.nekonihongo.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "exercise")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ----------- FK -----------

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id")
    private JlptLevel level;

    // ----------- DATA -----------

    @Column(name = "lesson_number", nullable = false)
    private Integer lessonNumber;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @Column(name = "total_questions", nullable = false)
    @Builder.Default
    private Integer totalQuestions = 10;

    // ----------- AUDIT -----------

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ----------- RELATION -----------

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions;
}
