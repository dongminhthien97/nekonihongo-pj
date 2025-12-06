// src/main/java/com/nekonihongo/backend/dto/UserResponse.java
package com.nekonihongo.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String username;
    private String fullName;
    private String avatarUrl;
    private String role;
    private int level;
    private int points;
    private int vocabularyProgress;
    private int kanjiProgress;
    private int grammarProgress;
    private int exerciseProgress;
    private LocalDate joinDate;
}