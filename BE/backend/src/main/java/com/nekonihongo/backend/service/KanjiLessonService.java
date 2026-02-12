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
                logger.info("Fetching all kanji lessons");
                long start = System.currentTimeMillis();

                List<KanjiLesson> lessons = kanjiLessonRepository.findAllWithKanjiAndCompounds();

                List<KanjiLessonDto> result = lessons.stream()
                                .map(this::convertToDto)
                                .collect(Collectors.toList());

                logger.info("Fetched " + result.size() + " lessons in " + (System.currentTimeMillis() - start) + "ms");
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
                List<KanjiDto> kanjiDtos = lesson.getKanjiList().stream()
                                .map(this::convertKanjiToDto)
                                .collect(Collectors.toList());

                return KanjiLessonDto.builder()
                                .lessonId(lesson.getId())
                                .lessonTitle(lesson.getTitle())
                                .icon(lesson.getIcon())
                                .displayOrder(lesson.getDisplayOrder())
                                .kanji(kanjiDtos)
                                .build();
        }

        private KanjiDto convertKanjiToDto(Kanji kanji) {
                List<KanjiCompoundDto> compoundDtos = kanji.getCompounds().stream()
                                .map(this::convertCompoundToDto)
                                .collect(Collectors.toList());

                return KanjiDto.builder()
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
        }

        private KanjiCompoundDto convertCompoundToDto(KanjiCompound compound) {
                try {
                        return KanjiCompoundDto.builder()
                                        .id(compound.getId())
                                        .word(compound.getWord())
                                        .reading(compound.getReading())
                                        .meaning(compound.getMeaning())
                                        .displayOrder(compound.getDisplayOrder())
                                        .build();
                } catch (Exception e) {
                        logger.severe("Error converting compound: " + compound.getId() + " - " + e.getMessage());
                        throw e;
                }
        }
}
