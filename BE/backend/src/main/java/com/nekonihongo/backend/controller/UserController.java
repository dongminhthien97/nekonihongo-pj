// src/main/java/com/nekonihongo/backend/controller/UserController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.*;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.UserRepository;
import com.nekonihongo.backend.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // ĐÃ SỬA: Vite chạy ở 5173
public class UserController {

    private final IUserService userService;
    private final UserRepository userRepository;

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    /* ====================== ADMIN ROUTES ====================== */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users, "Lấy danh sách user thành công!"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
        return ResponseEntity.ok(ApiResponse.success(toResponse(user)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/admin/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        try {
            User user = User.builder()
                    .email(request.getEmail())
                    .username(request.getUsername())
                    .fullName(request.getFullName())
                    .avatarUrl(request.getAvatarUrl())
                    .role(request.getRole() != null ? request.getRole() : User.Role.USER)
                    .level(request.getLevel() != null ? request.getLevel() : 1)
                    .points(request.getPoints() != null ? request.getPoints() : 0)
                    .build();

            User created = userService.createUser(user,
                    request.getPassword() != null ? request.getPassword() : "123456");

            return ResponseEntity.ok(ApiResponse.success(toResponse(created), "Tạo user thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/admin/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {
        try {
            User user = User.builder()
                    .username(request.getUsername())
                    .fullName(request.getFullName())
                    .avatarUrl(request.getAvatarUrl())
                    .role(request.getRole())
                    .level(request.getLevel())
                    .points(request.getPoints())
                    .build();

            User updated = userService.updateUser(id, user);
            return ResponseEntity.ok(ApiResponse.success(toResponse(updated), "Cập nhật thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa user thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /* ====================== USER ROUTES (cá nhân) ====================== */

    // API CẬP NHẬT AVATAR – FIX: resolve authenticated user reliably
    @PatchMapping("/api/user/me/avatar") // ĐÚNG CHÍNH XÁC
    public ResponseEntity<ApiResponse<UserResponse>> updateAvatar(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> body) {

        String avatarUrl = body.get("avatarUrl");
        if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
            currentUser.setAvatarUrl(avatarUrl.trim());
            userRepository.save(currentUser);
        }
        return ResponseEntity.ok(ApiResponse.success(toResponse(currentUser)));
    }

    // API lấy thông tin user hiện tại
    @GetMapping("/api/user/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(toResponse(currentUser)));
    }

    // Helper method
    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getRole().name(),
                user.getLevel(),
                user.getPoints(),
                user.getVocabularyProgress(),
                user.getKanjiProgress(),
                user.getGrammarProgress(),
                user.getExerciseProgress(),
                user.getJoinDate());
    }

    @PostMapping("/api/user/progress/vocabulary")
    @Transactional // QUAN TRỌNG NHẤT – BẮT BUỘC PHẢI CÓ!
    public ResponseEntity<ApiResponse<String>> recordFlashcardProgress(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, Integer> body) {

        // BẢO VỆ NULL – SIÊU AN TOÀN
        if (currentUser == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Chưa đăng nhập! Mèo không biết bạn là ai!"));
        }

        int learnedCount = body.getOrDefault("learnedCount", 0);
        if (learnedCount <= 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Số từ không hợp lệ"));
        }

        // GHI VÀO DB – CỘNG DỒN CHÍNH XÁC
        Integer current = Optional.ofNullable(currentUser.getVocabularyProgress()).orElse(0);
        currentUser.setVocabularyProgress(current + learnedCount);
        userRepository.save(currentUser);

        return ResponseEntity.ok(ApiResponse.success(
                "Học thêm " + learnedCount + " từ! Tổng: " + currentUser.getVocabularyProgress() + " từ"));
    }
}