package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.QuestionResponseDTO;
import com.nekonihongo.backend.service.GrammarQuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
@Slf4j
public class GrammarQuestionController {

    private final GrammarQuestionService grammarQuestionService;

    /**
     * GET /api/grammar/mini-test/questions?lesson_id=X or ?lessonId=X
     * Lấy câu hỏi theo lesson
     */
    @GetMapping("/mini-test/questions")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<QuestionResponseDTO>>> getQuestions(
            @RequestParam(value = "lessonId", required = false) Integer lessonId,
            @RequestParam(value = "lesson_id", required = false) Integer lessonIdLegacy) {

        Integer id = (lessonId != null) ? lessonId : lessonIdLegacy;

        if (id == null) {
            log.warn("GET /api/grammar/mini-test/questions - Missing lessonId");
            return ResponseEntity.badRequest().body(ApiResponse.error("lessonId is required", "MISSING_LESSON_ID"));
        }

        log.info("GET /api/grammar/mini-test/questions - Fetching questions for lesson: {}", id);

        List<QuestionResponseDTO> questions = grammarQuestionService.getQuestionsByLesson(id);

        log.info("GET /api/grammar/mini-test/questions - Returning {} questions", questions.size());

        return ResponseEntity.ok(ApiResponse.success(questions));
    }
}