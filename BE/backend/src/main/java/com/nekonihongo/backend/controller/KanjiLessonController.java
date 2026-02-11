package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.kanji.KanjiLessonDto;
import com.nekonihongo.backend.service.KanjiLessonService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kanji-lessons")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class KanjiLessonController {

    private final KanjiLessonService kanjiLessonService;

    @GetMapping("/kanji")
    public ApiResponse<List<KanjiLessonDto>> getAllLessonsWithKanji() {
        List<KanjiLessonDto> lessons = kanjiLessonService.getAllLessonsWithKanji();
        return ApiResponse.success(lessons);
    }

    @GetMapping("/{id}")
    public ApiResponse<KanjiLessonDto> getLessonById(@PathVariable Integer id) {
        KanjiLessonDto lesson = kanjiLessonService.getKanjiLessonById(id);
        if (lesson == null) {
            return ApiResponse.error("Không tìm thấy bài học Kanji");
        }
        return ApiResponse.success("Lấy bài học Kanji thành công!", lesson);
    }
}
