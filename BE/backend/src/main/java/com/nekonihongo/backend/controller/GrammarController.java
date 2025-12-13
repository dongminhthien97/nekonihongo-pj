// GrammarController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.grammar.GrammarLessonDto;
import com.nekonihongo.backend.dto.grammar.GrammarPointDto;
import com.nekonihongo.backend.dto.grammar.GrammarExampleDto;
import com.nekonihongo.backend.entity.GrammarLesson;
import com.nekonihongo.backend.repository.GrammarLessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class GrammarController {

    private final GrammarLessonRepository lessonRepository;

    @GetMapping("/lessons")
    public ApiResponse<List<GrammarLessonDto>> getAllLessons() {
        List<GrammarLesson> lessons = lessonRepository.findAllWithPointsAndExamples();

        List<GrammarLessonDto> dtos = lessons.stream().map(lesson -> new GrammarLessonDto(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getIcon(),
                lesson.getPoints().stream().map(point -> new GrammarPointDto(
                        point.getTitle(),
                        point.getMeaning(),
                        point.getExplanation(),
                        point.getExamples().stream()
                                .map(ex -> new GrammarExampleDto(ex.getJapanese(), ex.getVietnamese()))
                                .collect(Collectors.toList())))
                        .collect(Collectors.toList())))
                .collect(Collectors.toList());

        return ApiResponse.success(dtos, "Lấy danh sách bài học ngữ pháp thành công! Meow!");
    }

    @GetMapping("/lessons/{id}")
    public ApiResponse<GrammarLessonDto> getLesson(@PathVariable Integer id) {
        GrammarLesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học ngữ pháp!"));

        GrammarLessonDto dto = new GrammarLessonDto(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getIcon(),
                lesson.getPoints().stream().map(point -> new GrammarPointDto(
                        point.getTitle(),
                        point.getMeaning(),
                        point.getExplanation(),
                        point.getExamples().stream()
                                .map(ex -> new GrammarExampleDto(ex.getJapanese(), ex.getVietnamese()))
                                .collect(Collectors.toList())))
                        .collect(Collectors.toList()));

        return ApiResponse.success(dto);
    }
}