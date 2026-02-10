package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.kanji.KanjiCompoundDTO;
import com.nekonihongo.backend.service.KanjiCompoundService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kanji")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class KanjiCompoundController {

    private final KanjiCompoundService kanjiCompoundService;

    @GetMapping("/{kanjiId}/compounds")
    public ResponseEntity<List<KanjiCompoundDTO>> getCompoundsByKanjiId(@PathVariable Long kanjiId) {
        List<KanjiCompoundDTO> compounds = kanjiCompoundService.getCompoundsByKanjiId(kanjiId);
        return ResponseEntity.ok(compounds);
    }
}