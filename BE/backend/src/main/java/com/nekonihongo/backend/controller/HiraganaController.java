package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.HiraganaDTO;
import com.nekonihongo.backend.dto.request.HiraganaRequest;
import com.nekonihongo.backend.service.HiraganaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hiragana")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HiraganaController {
    private final HiraganaService hiraganaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HiraganaDTO>>> getAllHiragana() {
        List<HiraganaDTO> hiraganaList = hiraganaService.getAllHiragana();
        return ResponseEntity.ok(ApiResponse.success(hiraganaList));
    }

    @GetMapping("/{character}")
    public ResponseEntity<ApiResponse<HiraganaDTO>> getHiraganaDetail(@PathVariable String character) {
        HiraganaDTO hiragana = hiraganaService.getByCharacter(character);
        if (hiragana == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Hiragana not found", "NOT_FOUND"));
        }
        return ResponseEntity.ok(ApiResponse.success(hiragana));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HiraganaDTO>> createHiragana(@Valid @RequestBody HiraganaRequest request) {
        HiraganaDTO created = hiraganaService.createHiragana(request);
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HiraganaDTO>> updateHiragana(
            @PathVariable Integer id,
            @Valid @RequestBody HiraganaRequest request) {
        HiraganaDTO updated = hiraganaService.updateHiragana(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHiragana(@PathVariable Integer id) {
        hiraganaService.deleteHiragana(id);
        return ResponseEntity.ok(ApiResponse.success());
    }
}