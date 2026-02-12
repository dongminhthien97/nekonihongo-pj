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
     * Simple ping endpoint for basic connectivity checks.
     * Returns minimal response for faster keep-alive requests.
     */
    @GetMapping("/ping")
    public ApiResponse<String> ping() {
        return ApiResponse.success("pong");
    }
}
