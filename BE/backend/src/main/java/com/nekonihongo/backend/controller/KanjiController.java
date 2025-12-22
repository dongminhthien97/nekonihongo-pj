// src/main/java/com/nekonihongo/backend/controller/KanjiController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.kanji.KanjiCompoundDto;
import com.nekonihongo.backend.dto.kanji.KanjiDto;
import com.nekonihongo.backend.dto.kanji.KanjiLessonDto;
import com.nekonihongo.backend.entity.KanjiLesson;
import com.nekonihongo.backend.repository.KanjiLessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/kanji")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class KanjiController {

    private final KanjiLessonRepository repository;

    @GetMapping("/lessons")
    public ApiResponse<List<KanjiLessonDto>> getAllLessons() {
        List<KanjiLesson> lessons = repository.findAllWithKanji();

        List<KanjiLessonDto> dtos = lessons.stream()
                .sorted(Comparator.comparing(KanjiLesson::getDisplayOrder))
                .map(lesson -> new KanjiLessonDto(
                        lesson.getId(),
                        lesson.getTitle(),
                        lesson.getIcon(),
                        lesson.getKanjiList().stream()
                                .sorted(Comparator.comparing(k -> k.getDisplayOrder()))
                                .map(k -> new KanjiDto(
                                        k.getKanji(),
                                        k.getOnReading(),
                                        k.getKunReading() != null ? k.getKunReading() : "",
                                        k.getHanViet(),
                                        k.getMeaning(),
                                        k.getStrokes(),
                                        k.getStrokePaths().stream()
                                                .sorted(Comparator.comparing(p -> p.getStrokeOrder()))
                                                .map(p -> p.getPathData())
                                                .toList(),
                                        k.getCompounds().stream()
                                                .sorted(Comparator.comparing(c -> c.getDisplayOrder()))
                                                .map(c -> new KanjiCompoundDto(c.getWord(), c.getReading(),
                                                        c.getMeaning()))
                                                .toList()))
                                .toList()))
                .toList();

        return ApiResponse.success(dtos, "Lấy danh sách bài học Kanji thành công!");
    }

    @GetMapping("/lessons/{id}")
    public ApiResponse<KanjiLessonDto> getLesson(@PathVariable Integer id) {
        KanjiLesson lesson = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học Kanji"));

        KanjiLessonDto dto = new KanjiLessonDto(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getIcon(),
                lesson.getKanjiList().stream()
                        .sorted(Comparator.comparing(k -> k.getDisplayOrder()))
                        .map(k -> new KanjiDto(
                                k.getKanji(),
                                k.getOnReading(),
                                k.getKunReading() != null ? k.getKunReading() : "",
                                k.getHanViet(),
                                k.getMeaning(),
                                k.getStrokes(),
                                k.getStrokePaths().stream()
                                        .sorted(Comparator.comparing(p -> p.getStrokeOrder()))
                                        .map(p -> p.getPathData())
                                        .toList(),
                                k.getCompounds().stream()
                                        .sorted(Comparator.comparing(c -> c.getDisplayOrder()))
                                        .map(c -> new KanjiCompoundDto(c.getWord(), c.getReading(), c.getMeaning()))
                                        .toList()))
                        .toList());

        return ApiResponse.success(dto, "Lấy bài học Kanji thành công!");
    }
}