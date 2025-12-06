// src/main/java/com/nekonihongo/backend/service/AuthService.java
package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.AuthRequest;
import com.nekonihongo.backend.dto.AuthResponse;
import com.nekonihongo.backend.dto.UserResponse; // ĐÃ THÊM
import com.nekonihongo.backend.entity.User;
import lombok.RequiredArgsConstructor;

import org.hibernate.validator.internal.util.logging.Log;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IUserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(AuthRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email hoặc mật khẩu sai!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Email hoặc mật khẩu sai!");
        }

        // Claims cho JWT
        var claims = new HashMap<String, Object>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());

        String token = jwtService.generateToken(user.getEmail(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(
                        UserResponse.builder()
                                .id(user.getId())
                                .email(user.getEmail())
                                .username(user.getUsername())
                                .fullName(user.getFullName())
                                .avatarUrl(user.getAvatarUrl())
                                .role(user.getRole().name().toLowerCase())
                                .level(user.getLevel())
                                .points(user.getPoints())
                                .vocabularyProgress(user.getVocabularyProgress())
                                .kanjiProgress(user.getKanjiProgress())
                                .grammarProgress(user.getGrammarProgress())
                                .exerciseProgress(user.getExerciseProgress())
                                .joinDate(user.getJoinDate())
                                .build())
                .build();
    }
}