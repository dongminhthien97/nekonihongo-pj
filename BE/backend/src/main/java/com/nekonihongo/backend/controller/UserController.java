// src/main/java/com/nekonihongo/backend/controller/UserController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.*;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.UserRepository;
import com.nekonihongo.backend.service.ActivityLogService;
import com.nekonihongo.backend.service.IUserService;
import com.nekonihongo.backend.entity.ActivityLog;
import com.nekonihongo.backend.service.ActivityLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final IUserService userService;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    /* ====================== ADMIN ROUTES ====================== */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách user thành công!", users));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin user thành công", toResponse(user)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/admin/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .fullName(request.getFullName())
                .avatarUrl(request.getAvatarUrl())
                .role(request.getRole() != null ? request.getRole() : User.Role.USER)
                .level(request.getLevel() != null ? request.getLevel() : 1)
                .points(request.getPoints() != null ? request.getPoints() : 0)
                .streak(request.getStreak() != null ? request.getStreak() : 0)
                .longestStreak(request.getLongestStreak() != null ? request.getLongestStreak() : 0)
                .build();

        User created = userService.createUser(user,
                request.getPassword() != null ? request.getPassword() : "123456");

        return ResponseEntity.ok(ApiResponse.success("Tạo user thành công!", toResponse(created)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/admin/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .avatarUrl(request.getAvatarUrl())
                .role(request.getRole())
                .level(request.getLevel() != null ? request.getLevel() : 1)
                .points(request.getPoints() != null ? request.getPoints() : 0)
                .streak(request.getStreak() != null ? request.getStreak() : 0)
                .longestStreak(request.getLongestStreak() != null ? request.getLongestStreak() : 0)
                .build();

        User updated = userService.updateUser(id, user);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công!", toResponse(updated)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa user thành công!", null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/activity-logs")
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getActivityLogs() {
        List<ActivityLogResponse> logs = activityLogService.getAllLogs();
        return ResponseEntity.ok(ApiResponse.success("Lấy logs thành công!", logs));
    }

    /* ====================== USER ROUTES ====================== */
    @PatchMapping("/api/user/me/avatar")
    public ResponseEntity<ApiResponse<UserResponse>> updateAvatar(
            Authentication authentication,
            @RequestBody Map<String, String> body) {

        String identifier = authentication.getName(); // username/email từ token
        User currentUser = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));

        String avatarUrl = body.get("avatarUrl");
        if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
            currentUser.setAvatarUrl(avatarUrl.trim());
            userRepository.save(currentUser);
        }
        return ResponseEntity.ok(ApiResponse.success("Cập nhật avatar thành công!", toResponse(currentUser)));
    }

    @GetMapping("/api/user/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        String identifier = authentication.getName(); // lấy username/email từ principal
        User currentUser = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));

        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin user thành công", toResponse(currentUser)));
    }

    private UserResponse toResponse(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User is null, cannot convert to response");
        }
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .level(user.getLevel())
                .points(user.getPoints())
                .streak(user.getStreak())
                .longestStreak(user.getLongestStreak())
                .joinDate(user.getJoinDate())
                .lastLoginDate(user.getLastLoginDate())
                .build();
    }
}
