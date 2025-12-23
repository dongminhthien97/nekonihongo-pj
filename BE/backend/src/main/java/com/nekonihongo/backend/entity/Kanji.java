// src/main/java/com/nekonihongo/backend/entity/Kanji.java
package com.nekonihongo.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "kanji")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Kanji {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private KanjiLesson lesson;

    @Column(nullable = false, length = 1, unique = true)
    private String kanji;

    @Column(name = "on_reading", nullable = false)
    private String onReading;

    @Column(name = "kun_reading")
    private String kunReading;

    @Column(name = "han_viet", nullable = false)
    private String hanViet;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String meaning;

    @Column(nullable = false)
    private Integer strokes;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @OneToMany(mappedBy = "kanji", cascade = { CascadeType.ALL }, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<KanjiCompound> compounds = new ArrayList<>();

    // ĐÃ XÓA: List<KanjiStrokePath> strokePaths và svgPaths
}