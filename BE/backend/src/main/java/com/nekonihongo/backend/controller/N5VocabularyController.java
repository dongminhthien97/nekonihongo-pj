// src/main/java/com/neko/controller/N5VocabularyController.java
package com.nekonihongo.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nekonihongo.backend.dto.N5VocabularyDTO;
import com.nekonihongo.backend.service.N5VocabularyService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // thay bằng domain FE khi deploy
public class N5VocabularyController {

    private final N5VocabularyService n5VocabularyService;

    /**
     * GET /api/vocabulary/n5
     * Lấy danh sách từ vựng N5 (phân trang + tìm kiếm)
     * Params: page (default 1), size (default 50), q (query tìm kiếm)
     */
    @GetMapping("/n5")
    public ResponseEntity<Map<String, Object>> getN5(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "50") int size,
            @RequestParam(name = "q", required = false) String q) {

        Map<String, Object> response = new HashMap<>();
        try {
            Page<N5VocabularyDTO> result;

            if (q != null && !q.trim().isEmpty()) {
                result = n5VocabularyService.searchN5(q.trim(), page, size);
            } else {
                result = n5VocabularyService.getAllN5(page, size);
            }

            response.put("success", true);
            response.put("data", result.getContent());
            response.put("pagination", Map.of(
                    "page", page,
                    "size", size,
                    "total", result.getTotalElements(),
                    "totalPages", result.getTotalPages()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi lấy dữ liệu N5: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * GET /api/vocabulary/n5/count
     * Lấy tổng số từ N5 (tùy chọn, dùng để hiển thị thông tin)
     */
    @GetMapping("/n5/count")
    public ResponseEntity<Map<String, Object>> getN5Count() {
        Map<String, Object> response = new HashMap<>();
        try {
            long count = n5VocabularyService.getTotalCount();
            response.put("success", true);
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi đếm từ N5: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}