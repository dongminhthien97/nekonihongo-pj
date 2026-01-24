// src/main/java/com/nekonihongo/backend/controller/NotificationController.java
package com.nekonihongo.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> request) {
        try {
            log.info("Creating notification: {}", request);

            // Lấy thông tin từ request
            Long userId = ((Number) request.get("user_id")).longValue();
            String type = (String) request.get("type");
            String title = (String) request.get("title");
            String message = (String) request.get("message");
            Long relatedId = request.get("related_id") != null ? ((Number) request.get("related_id")).longValue()
                    : null;

            log.info("Notification created for user {}: {} - {}",
                    userId, title, message);

            // Ở đây bạn có thể lưu vào database nếu cần
            // notificationService.createNotification(userId, type, title, message,
            // relatedId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification created successfully"));
        } catch (Exception e) {
            log.error("Error creating notification: ", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error creating notification: " + e.getMessage()));
        }
    }
}