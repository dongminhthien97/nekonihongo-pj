package com.nekonihongo.backend.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nekonihongo.backend.dto.kanji.KanjiCompoundDto;
import com.nekonihongo.backend.dto.kanji.KanjiDto;
import com.nekonihongo.backend.dto.kanji.KanjiLessonDto;
import com.nekonihongo.backend.entity.Kanji;
import com.nekonihongo.backend.entity.KanjiCompound;
import com.nekonihongo.backend.entity.KanjiLesson;
import com.nekonihongo.backend.repository.KanjiLessonRepository;

@Service
public class KanjiLessonService {

        private static final Logger logger = Logger.getLogger(KanjiLessonService.class.getName());

        @Autowired
        private KanjiLessonRepository kanjiLessonRepository;

        @Transactional(readOnly = true)
        public List<KanjiLessonDto> getAllKanjiLessons() {
                logger.info("=== START: getAllKanjiLessons() ===");
                long startTime = System.currentTimeMillis();
                logger.info("Step 1: Starting repository query...");

                // Log database statistics
                long lessonCount = kanjiLessonRepository.countLessons();
                long kanjiCount = kanjiLessonRepository.countKanji();
                long compoundCount = kanjiLessonRepository.countCompounds();
                logger.info("Database stats: Lessons=" + lessonCount + ", Kanji=" + kanjiCount + ", Compounds="
                                + compoundCount);

                List<KanjiLesson> lessons = kanjiLessonRepository.findAllWithKanjiAndCompounds();
                long queryTime = System.currentTimeMillis() - startTime;
                logger.info("Step 2: Repository query completed in " + queryTime + "ms");
                logger.info("Step 3: Repository returned " + lessons.size() + " lessons");

                if (lessons.isEmpty()) {
                        logger.warning("WARNING: No lessons found in database!");
                        return java.util.Collections.emptyList();
                }

                logger.info("Step 4: Starting DTO conversion...");
                long conversionStartTime = System.currentTimeMillis();

                List<KanjiLessonDto> result = lessons.stream()
                                .map(entity -> convertToDto(entity))
                                .collect(Collectors.toList());

                long conversionTime = System.currentTimeMillis() - conversionStartTime;
                long totalTime = System.currentTimeMillis() - startTime;

                logger.info("Step 5: DTO conversion completed in " + conversionTime + "ms");
                logger.info("Step 6: Total processing time: " + totalTime + "ms");
                logger.info("Step 7: Final result contains " + result.size() + " lessons");
                logger.info("=== END: getAllKanjiLessons() ===");

                return result;
        }

        @Transactional(readOnly = true)
        public List<KanjiLessonDto> getAllLessonsWithKanji() {
                logger.info("Starting to fetch all lessons with kanji");
                long startTime = System.currentTimeMillis();

                List<KanjiLesson> lessons = kanjiLessonRepository.findAllWithKanjiAndCompounds();
                logger.info("Repository returned " + lessons.size() + " lessons");

                List<KanjiLessonDto> result = lessons.stream()
                                .map(entity -> convertToDto(entity))
                                .collect(Collectors.toList());

                long duration = System.currentTimeMillis() - startTime;
                logger.info("Completed mapping " + result.size() + " lessons in " + duration + "ms");

                return result;
        }

        @Transactional(readOnly = true)
        public KanjiLessonDto getKanjiLessonById(Integer id) {
                return kanjiLessonRepository.findById(id)
                                .map(this::convertToDto)
                                .orElse(null);
        }

        private KanjiLessonDto convertToDto(KanjiLesson lesson) {
                logger.info("=== START: convertToDto for lesson: " + lesson.getTitle() + " ===");
                logger.info("Step 1: Lesson ID: " + lesson.getId() + ", Title: " + lesson.getTitle());
                logger.info("Step 2: Lesson has " + lesson.getKanjiList().size() + " kanji characters");

                if (lesson.getKanjiList().isEmpty()) {
                        logger.warning("WARNING: Lesson " + lesson.getTitle() + " has no kanji characters!");
                }

                logger.info("Step 3: Starting kanji conversion...");
                long kanjiStartTime = System.currentTimeMillis();

                List<KanjiDto> kanjiDtos = lesson.getKanjiList().stream()
                                .map(this::convertKanjiToDto)
                                .collect(Collectors.toList());

                long kanjiConversionTime = System.currentTimeMillis() - kanjiStartTime;
                logger.info("Step 4: Kanji conversion completed in " + kanjiConversionTime + "ms");
                logger.info("Step 5: Successfully converted " + kanjiDtos.size() + " kanji for lesson: "
                                + lesson.getTitle());

                KanjiLessonDto result = KanjiLessonDto.builder()
                                .lessonId(lesson.getId())
                                .lessonTitle(lesson.getTitle())
                                .icon(lesson.getIcon())
                                .displayOrder(lesson.getDisplayOrder())
                                .kanji(kanjiDtos)
                                .build();

                logger.info("Step 6: Lesson DTO created successfully");
                logger.info("=== END: convertToDto for lesson: " + lesson.getTitle() + " ===");

                return result;
        }

        private KanjiDto convertKanjiToDto(Kanji kanji) {
                logger.info("=== START: convertKanjiToDto for kanji: " + kanji.getKanji() + " ===");
                logger.info("Step 1: Kanji ID: " + kanji.getId() + ", Character: " + kanji.getKanji());
                logger.info("Step 2: Kanji has " + kanji.getCompounds().size() + " compounds");

                if (kanji.getCompounds().isEmpty()) {
                        logger.warning("WARNING: Kanji " + kanji.getKanji() + " has no compounds!");
                }

                logger.info("Step 3: Starting compound conversion...");
                long compoundStartTime = System.currentTimeMillis();

                List<KanjiCompoundDto> compoundDtos = kanji.getCompounds().stream()
                                .map(this::convertCompoundToDto)
                                .collect(java.util.stream.Collectors.toList());

                long compoundConversionTime = System.currentTimeMillis() - compoundStartTime;
                logger.info("Step 4: Compound conversion completed in " + compoundConversionTime + "ms");
                logger.info("Step 5: Successfully converted " + compoundDtos.size() + " compounds for kanji: "
                                + kanji.getKanji());

                KanjiDto result = KanjiDto.builder()
                                .id(kanji.getId())
                                .kanji(kanji.getKanji())
                                .onReading(kanji.getOnReading())
                                .kunReading(kanji.getKunReading())
                                .hanViet(kanji.getHanViet())
                                .meaning(kanji.getMeaning())
                                .strokes(kanji.getStrokes())
                                .displayOrder(kanji.getDisplayOrder())
                                .compounds(compoundDtos)
                                .build();

                logger.info("Step 6: Kanji DTO created successfully");
                logger.info("=== END: convertKanjiToDto for kanji: " + kanji.getKanji() + " ===");

                return result;
        }

        private KanjiCompoundDto convertCompoundToDto(KanjiCompound compound) {
                logger.info("=== START: convertCompoundToDto for compound: " + compound.getWord() + " ===");
                logger.info("Step 1: Compound ID: " + compound.getId() + ", Word: " + compound.getWord());
                logger.info("Step 2: Parent kanji: " + compound.getKanji().getKanji());
                logger.info("Step 3: Reading: " + compound.getReading() + ", Meaning: " + compound.getMeaning());

                try {
                        KanjiCompoundDto dto = KanjiCompoundDto.builder()
                                        .id(compound.getId())
                                        .word(compound.getWord())
                                        .reading(compound.getReading())
                                        .meaning(compound.getMeaning())
                                        .displayOrder(compound.getDisplayOrder())
                                        .build();

                        logger.info("Step 4: Compound DTO created successfully");
                        logger.info("=== END: convertCompoundToDto for compound: " + compound.getWord() + " ===");
                        return dto;

                } catch (Exception e) {
                        logger.severe("ERROR: Failed to convert compound " + compound.getWord() + ": "
                                        + e.getMessage());
                        logger.severe("Compound details: ID=" + compound.getId() + ", Word=" + compound.getWord());
                        throw e;
                }
        }
}