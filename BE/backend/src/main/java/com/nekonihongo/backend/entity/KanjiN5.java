// src/main/java/com/nekonihongo/backend/entity/KanjiN5.java
package com.nekonihongo.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kanji_n5")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanjiN5 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String kanji; // 人, 日, 月...

    @Column(length = 50)
    private String hanViet; // Nhân, Nhật, Nguyệt...

    @Column(nullable = false, length = 100)
    private String meaning; // người, ngày, mặt trăng...

    @Column(length = 100)
    private String onYomi; // ジン, ニチ, ゲツ...

    @Column(length = 100)
    private String kunYomi; // ひと, ひ, つき...

    @Column(length = 20)
    private String stt; // "1", "2", "3"... để hiển thị STT
}