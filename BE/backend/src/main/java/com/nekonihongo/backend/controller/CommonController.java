package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.CategoryDTO;
import com.nekonihongo.backend.dto.JlptLevelDTO;
import com.nekonihongo.backend.service.CategoryService;
import com.nekonihongo.backend.service.JlptLevelService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CommonController {

    private final CategoryService categoryService;
    private final JlptLevelService jlptLevelService;

    @GetMapping("/categories")
    public List<CategoryDTO> getCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/levels")
    public List<JlptLevelDTO> getLevels() {
        return jlptLevelService.getAllLevels();
    }

    /**
     * Enhanced health endpoint for keep-alive functionality and system status
     * monitoring.
     * This endpoint is designed to handle Render sleep, cold start scenarios, and
     * provide
     * meaningful status information for load balancers and monitoring systems.
     */
    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> healthInfo = new HashMap<>();

        // Basic system information
        healthInfo.put("status", "UP");
        healthInfo.put("service", "nekonihongo-backend");
        healthInfo.put("version", "1.0.0");

        // Database connectivity check (lightweight)
        try {
            categoryService.getAllCategories();
            jlptLevelService.getAllLevels();
            healthInfo.put("database", "CONNECTED");
        } catch (Exception e) {
            log.warn("Health check - database connection failed: {}", e.getMessage());
            healthInfo.put("database", "DISCONNECTED");
            healthInfo.put("status", "DOWN");
        }

        // Application readiness
        healthInfo.put("ready", true);
        healthInfo.put("upTime", System.currentTimeMillis());

        // Return appropriate response based on health
        if ("UP".equals(healthInfo.get("status"))) {
            return ApiResponse.success(healthInfo);
        } else {
            // This will be wrapped by GlobalResponseHandler, but we need to return
            // the data structure
            return ApiResponse.success(healthInfo);
        }
    }

    /**
     * Simple ping endpoint for basic connectivity checks.
     * Returns minimal response for faster keep-alive requests.
     */
    @GetMapping("/ping")
    public ApiResponse<String> ping() {
        return ApiResponse.success("pong");
    }
}
