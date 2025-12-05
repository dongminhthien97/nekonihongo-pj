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
    private int vocabularyProgress = 0;
    private int kanjiProgress = 0;
    private int grammarProgress = 0;

    private LocalDate joinDate = LocalDate.now();

    public enum Role {
        USER, ADMIN
    }
}