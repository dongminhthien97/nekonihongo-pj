// src/main/java/com/neko/model/entity/N5Vocabulary.java
package com.nekonihongo.backend.entity;

import org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "n5_vocabulary")
@NamingStrategy(PhysicalNamingStrategyStandardImpl.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class N5Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "level")
    private String level = "N5";

    @Column(nullable = false, name = "stt")
    private String stt; // số thứ tự

    @Column(nullable = false, name = "tuVung")
    private String tuVung; // hiragana/katakana

    @Column(name = "hanTu")
    private String hanTu; // kanji (có thể null)

    @Column(nullable = false, name = "tiengViet")
    private String tiengViet;

    @Column(name = "viDu")
    private String viDu; // ví dụ câu (có thể null)
}