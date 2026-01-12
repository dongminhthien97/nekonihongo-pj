// src/main/java/com/nekonihongo/backend/controller/NotificationController.java (tạo mới để fix unread-count)
package com.nekonihongo.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class NotificationController {

    // Fix 404 cho GET /api/admin/notifications/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        // TODO: Implement real count từ table notifications hoặc pending tests
        // Hiện tại trả count = 0 để bell không badge đỏ khi chưa có data
        Map<String, Integer> response = new HashMap<>();
        response.put("count", 0);

        return ResponseEntity.ok(response);
    }
}