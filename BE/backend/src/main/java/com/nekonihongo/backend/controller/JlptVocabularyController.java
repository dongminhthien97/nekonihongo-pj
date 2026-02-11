package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.JlptVocabularyDTO;
import com.nekonihongo.backend.service.JlptVocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JlptVocabularyController {

    private final JlptVocabularyService jlptVocabularyService;

    @GetMapping("/{level}")
    public ResponseEntity<ApiResponse<Page<JlptVocabularyDTO>>> getByLevel(
            @PathVariable("level") String level,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "50") int size,
            @RequestParam(name = "q", required = false) String q) {

        String upperLevel = level.toUpperCase();
        if (!upperLevel.matches("N[1-5]")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid level. Supported: N1-N5", "INVALID_LEVEL"));
        }

        Page<JlptVocabularyDTO> result;
        if (q != null && !q.trim().isEmpty()) {
            result = jlptVocabularyService.searchByLevel(upperLevel, q.trim(), page, size);
        } else {
            result = jlptVocabularyService.getByLevel(upperLevel, page, size);
        }

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{level}/count")
    public ResponseEntity<ApiResponse<Long>> getCountByLevel(@PathVariable("level") String level) {
        String upperLevel = level.toUpperCase();
        if (!upperLevel.matches("N[1-5]")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid level. Supported: N1-N5", "INVALID_LEVEL"));
        }

        long count = jlptVocabularyService.getCountByLevel(upperLevel);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getTotalCount() {
        long count = jlptVocabularyService.getTotalCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}