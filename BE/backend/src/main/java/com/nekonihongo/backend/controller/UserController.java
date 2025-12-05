// src/main/java/com/nekonihongo/backend/controller/UserController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.UserRequest;
import com.nekonihongo.backend.dto.UserResponse;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Vite FE
public class UserController {

    private final IUserService userService;

    // 1. Lấy danh sách tất cả user
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(users, "Lấy danh sách user thành công!"));
    }

    // 2. Lấy 1 user theo ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));

        return ResponseEntity.ok(ApiResponse.success(toResponse(user)));
    }

    // 3. Tạo user mới (admin tạo)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
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

    // 4. Cập nhật user
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {
        try {
            User user = User.builder()
                    .email(request.getEmail())
                    .username(request.getUsername())
                    .fullName(request.getFullName())
                    .avatarUrl(request.getAvatarUrl())
                    .role(request.getRole() != null ? request.getRole() : User.Role.USER)
                    .level(request.getLevel() != null && request.getLevel() > 0 ? request.getLevel() : 1)
                    .points(request.getPoints() != null && request.getPoints() >= 0 ? request.getPoints() : 0)
                    .build();

            User updated = userService.updateUser(id, user);
            return ResponseEntity.ok(ApiResponse.success(toResponse(updated), "Cập nhật thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // 5. Xóa user
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa user thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Helper: convert Entity → DTO
    @PreAuthorize("hasRole('ADMIN')")
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
                user.getJoinDate());
    }
}