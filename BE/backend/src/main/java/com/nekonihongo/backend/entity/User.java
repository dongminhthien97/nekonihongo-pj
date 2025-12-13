package com.nekonihongo.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String username;
    private String fullName;
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    private int level = 1;
    private int points = 0;
    private int streak = 0;

    // CÁC CỘT TIẾN ĐỘ
    @Column(name = "vocabulary_progress", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int vocabularyProgress = 0;

    @Column(name = "kanji_progress", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int kanjiProgress = 0;

    @Column(name = "grammar_progress", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int grammarProgress = 0;

    // CỘT MỚI – BẠN MUỐN THÊM
    @Column(name = "exercise_progress", nullable = false, columnDefinition = "INT DEFAULT 0")
    private int exerciseProgress = 0;

    private LocalDate joinDate = LocalDate.now();

    public enum Role {
        USER("user"),
        ADMIN("admin");

        private final String value;

        Role(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}