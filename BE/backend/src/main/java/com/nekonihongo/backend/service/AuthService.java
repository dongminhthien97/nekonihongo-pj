// src/main/java/com/nekonihongo/backend/service/AuthService.java
package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.AuthRequest;
import com.nekonihongo.backend.dto.AuthResponse;
import com.nekonihongo.backend.dto.UserResponse;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final PasswordEncoder passwordEncoder;
        private final StreakService streakService;

        public AuthResponse login(AuthRequest request) {

                // 1️⃣ Tìm user theo email
                User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                                .orElseThrow(() -> {
                                        log.warn("LOGIN FAILED - user not found [{}]", request.getEmail());
                                        return new BadCredentialsException("Email hoặc mật khẩu sai!");
                                });

                // 🔍 DEBUG LOG – xem password trong DB thực tế là gì
                log.warn("LOGIN ATTEMPT email={}, dbPassword={}",
                                request.getEmail(), user.getPassword());

                // 2️⃣ Check password
                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        log.warn("LOGIN FAILED - password mismatch [{}]", request.getEmail());
                        throw new BadCredentialsException("Email hoặc mật khẩu sai!");
                }

                // 3️⃣ Update streak
                streakService.updateLoginStreak(user);
                userRepository.save(user);

                // 4️⃣ Claims cho JWT
                var claims = new HashMap<String, Object>();
                claims.put("role", user.getRole().name());
                claims.put("userId", user.getId());

                // 5️⃣ Generate token
                String token = jwtService.generateToken(user.getEmail(), claims);
                String refreshToken = jwtService.generateRefreshToken(user.getEmail());

                // 6️⃣ Response
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
                                                                .streak(user.getStreak())
                                                                .longestStreak(user.getLongestStreak())
                                                                .lastLoginDate(user.getLastLoginDate())
                                                                .joinDate(user.getJoinDate())
                                                                .build())
                                .build();
        }
}
