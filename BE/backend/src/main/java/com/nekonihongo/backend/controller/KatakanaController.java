package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.KatakanaDTO;
import com.nekonihongo.backend.dto.request.KatakanaRequest;
import com.nekonihongo.backend.service.KatakanaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/katakana")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class KatakanaController {
    private final KatakanaService katakanaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KatakanaDTO>>> getAllKatakana() {
        List<KatakanaDTO> katakanaList = katakanaService.getAllKatakana();
        return ResponseEntity.ok(ApiResponse.success(katakanaList));
    }

    @GetMapping("/{character}")
    public ResponseEntity<ApiResponse<KatakanaDTO>> getKatakanaDetail(@PathVariable String character) {
        KatakanaDTO katakana = katakanaService.getByCharacter(character);
        if (katakana == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Katakana not found", "NOT_FOUND"));
        }
        return ResponseEntity.ok(ApiResponse.success(katakana));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KatakanaDTO>> createKatakana(@Valid @RequestBody KatakanaRequest request) {
        KatakanaDTO created = katakanaService.createKatakana(request);
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KatakanaDTO>> updateKatakana(
            @PathVariable Integer id,
            @Valid @RequestBody KatakanaRequest request) {
        KatakanaDTO updated = katakanaService.updateKatakana(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteKatakana(@PathVariable Integer id) {
        katakanaService.deleteKatakana(id);
        return ResponseEntity.ok(ApiResponse.success());
    }
}