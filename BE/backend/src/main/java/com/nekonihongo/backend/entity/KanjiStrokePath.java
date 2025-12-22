// src/main/java/com/nekonihongo/backend/entity/KanjiStrokePath.java
package com.nekonihongo.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kanji_stroke_paths")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiStrokePath {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kanji_id", nullable = false)
    private Kanji kanji;

    @Column(name = "path_data", columnDefinition = "TEXT", nullable = false)
    private String pathData;

    @Column(name = "stroke_order", nullable = false)
    private Integer strokeOrder;
}