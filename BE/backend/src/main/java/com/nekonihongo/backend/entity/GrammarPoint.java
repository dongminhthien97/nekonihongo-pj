// GrammarPoint.java
package com.nekonihongo.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "grammar_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class GrammarPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private GrammarLesson lesson;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String meaning;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String explanation;

    @OneToMany(mappedBy = "point", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<GrammarExample> examples = new ArrayList<>();
}