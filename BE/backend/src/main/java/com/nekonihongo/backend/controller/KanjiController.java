package com.nekonihongo.backend.controller;

import java.util.List;
import java.util.logging.Logger;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.KanjiJlptDTO;
import com.nekonihongo.backend.dto.kanji.KanjiLessonDto;
import com.nekonihongo.backend.enums.JlptLevelType;
import com.nekonihongo.backend.service.KanjiLessonService;
import com.nekonihongo.backend.service.KanjiService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/kanji")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class KanjiController {

        private static final Logger logger = Logger.getLogger(KanjiController.class.getName());

        private final KanjiLessonService kanjiLessonService;
        private final KanjiService kanjiService;

        @GetMapping("/lessons")
        public ResponseEntity<List<KanjiLessonDto>> getAllKanjiLessons() {
                logger.info("=== START: HTTP GET /api/kanji/lessons ===");
                logger.info("Step 1: Received request for all Kanji lessons");
                long startTime = System.currentTimeMillis();
                logger.info("Step 2: Starting service call...");

                List<KanjiLessonDto> lessonDtos = kanjiLessonService.getAllKanjiLessons();

                long serviceTime = System.currentTimeMillis() - startTime;
                logger.info("Step 3: Service call completed in " + serviceTime + "ms");
                logger.info("Step 4: Service returned " + lessonDtos.size() + " lessons");

                long responseStartTime = System.currentTimeMillis();
                ResponseEntity<List<KanjiLessonDto>> response = ResponseEntity.ok(lessonDtos);
                long responseTime = System.currentTimeMillis() - responseStartTime;

                long totalTime = System.currentTimeMillis() - startTime;
                logger.info("Step 5: HTTP response created in " + responseTime + "ms");
                logger.info("Step 6: Total request processing time: " + totalTime + "ms");
                logger.info("=== END: HTTP GET /api/kanji/lessons ===");

                return response;
        }

        @GetMapping("/lessons/{id}")
        public ApiResponse<KanjiLessonDto> getLesson(@PathVariable Integer id) {
                logger.info("Received request for Kanji lesson with ID: " + id);

                KanjiLessonDto lesson = kanjiLessonService.getKanjiLessonById(id);
                if (lesson == null) {
                        logger.warning("Kanji lesson not found with ID: " + id);
                        return ApiResponse.error("Không tìm thấy bài học Kanji", "NOT_FOUND");
                }

                logger.info("Successfully found Kanji lesson: " + lesson.getLessonTitle());
                return ApiResponse.success("Lấy bài học Kanji thành công!", lesson);
        }

        // API mới - lấy kanji theo cấp độ JLPT
        @GetMapping("/jlpt/{level}")
        public ApiResponse<List<KanjiJlptDTO>> getKanjiByJlptLevel(@PathVariable("level") String level) {
                try {
                        logger.info("Received request for Kanji by JLPT level: " + level);
                        JlptLevelType jlptLevel = JlptLevelType.valueOf(level.toUpperCase());
                        List<KanjiJlptDTO> kanjiList = kanjiService.getKanjiByLevel(jlptLevel);
                        return ApiResponse.success(
                                        String.format("Lấy danh sách Kanji %s thành công!", level.toUpperCase()),
                                        kanjiList);
                } catch (IllegalArgumentException e) {
                        logger.warning("Invalid JLPT level: " + level);
                        return ApiResponse.error("Cấp độ JLPT không hợp lệ. Các cấp độ: N5, N4, N3, N2, N1",
                                        "INVALID_LEVEL");
                }
        }

        // API lấy tất cả kanji JLPT
        @GetMapping("/jlpt/all")
        public ApiResponse<List<KanjiJlptDTO>> getAllJlptKanji() {
                logger.info("Received request for all JLPT Kanji");
                List<KanjiJlptDTO> kanjiList = kanjiService.getAllJlptKanji();
                return ApiResponse.success("Lấy tất cả Kanji JLPT thành công!", kanjiList);
        }

        @GetMapping("/jlpt/{level}/count")
        public ApiResponse<Long> getKanjiCountByJlptLevel(@PathVariable("level") String level) {
                try {
                        logger.info("Received request for Kanji count by JLPT level: " + level);
                        JlptLevelType jlptLevel = JlptLevelType.valueOf(level.toUpperCase());
                        long count = kanjiService.getKanjiCountByLevel(jlptLevel);
                        return ApiResponse.success(
                                        String.format("Lấy số lượng Kanji %s thành công!", level.toUpperCase()),
                                        count);
                } catch (IllegalArgumentException e) {
                        logger.warning("Invalid JLPT level for count: " + level);
                        return ApiResponse.error("Cấp độ JLPT không hợp lệ. Các cấp độ: N5, N4, N3, N2, N1",
                                        "INVALID_LEVEL");
                }
        }
}