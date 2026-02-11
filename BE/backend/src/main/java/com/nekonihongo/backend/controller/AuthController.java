// src/main/java/com/nekonihongo/backend/controller/AuthController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
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

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final ApplicationStateService applicationStateService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        // Check if application is still starting up
        if (!applicationStateService.isStartupComplete()) {
            log.warn("AUTH ATTEMPT DURING STARTUP | email={}", request.getEmail());

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("Hệ thống đang khởi động, vui lòng thử lại sau", "STARTUP_IN_PROGRESS"));
        }

        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            // Re-throw the exception to be handled by GlobalExceptionHandler
            throw e;
        }
    }
}
