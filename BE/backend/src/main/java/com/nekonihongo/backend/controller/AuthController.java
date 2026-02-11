// src/main/java/com/nekonihongo/backend/controller/AuthController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.AuthRequest;
import com.nekonihongo.backend.dto.AuthResponse;
import com.nekonihongo.backend.service.ApplicationStateService;
import com.nekonihongo.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final ApplicationStateService applicationStateService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        // Check if application is still starting up
        if (!applicationStateService.isStartupComplete()) {
            log.warn("AUTH ATTEMPT DURING STARTUP | email={}", request.getEmail());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
            errorResponse.put("error", "Service Unavailable");
            errorResponse.put("message", "Hệ thống đang khởi động, vui lòng thử lại sau");
            errorResponse.put("path", "/api/auth/login");

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        }

        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Re-throw the exception to be handled by GlobalExceptionHandler
            throw e;
        }
    }
}
