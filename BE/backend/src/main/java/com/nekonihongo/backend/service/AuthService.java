package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.AuthRequest;
import com.nekonihongo.backend.dto.AuthResponse;
import com.nekonihongo.backend.dto.UserResponse;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

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

                try {
                        // 1. Tìm user theo email
                        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                                        .orElseThrow(() -> new BadCredentialsException("Email hoặc mật khẩu sai!"));

                        // 2. Check trạng thái tài khoản
                        if (user.getStatus() != User.Status.ACTIVE) {
                                throw new BadCredentialsException("Tài khoản đã bị khóa hoặc vô hiệu hóa");
                        }

                        // 3. Check password (BCrypt)
                        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                                throw new BadCredentialsException("Email hoặc mật khẩu sai!");
                        }

                        // 4. Update streak (đã save trong service)
                        streakService.updateLoginStreak(user);

                        // 5. JWT claims
                        var claims = new HashMap<String, Object>();
                        claims.put("role", user.getRole().name());
                        claims.put("userId", user.getId());

                        // 6. Generate token
                        String token = jwtService.generateToken(user.getEmail(), claims);
                        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

                        // 7. Response
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

                } catch (BadCredentialsException e) {
                        log.warn("LOGIN FAILED [{}] - {}", request.getEmail(), e.getMessage());
                        throw e;
                } catch (Exception e) {
                        log.error("LOGIN ERROR [{}]", request.getEmail(), e);
                        throw new RuntimeException("Lỗi hệ thống khi đăng nhập");
                }
        }
}
