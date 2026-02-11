package com.nekonihongo.backend.service;

import java.util.List;
import java.util.stream.Collectors;

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

        @Autowired
        private KanjiLessonRepository kanjiLessonRepository;

        @Transactional(readOnly = true)
        public List<KanjiLessonDto> getAllKanjiLessons() {
                List<KanjiLesson> lessons = kanjiLessonRepository.findAllWithKanjiAndCompounds();

                return lessons.stream()
                                .map(entity -> convertToDto(entity))
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<KanjiLessonDto> getAllLessonsWithKanji() {
                List<KanjiLesson> lessons = kanjiLessonRepository.findAllWithKanjiAndCompounds();

                return lessons.stream()
                                .map(entity -> convertToDto(entity))
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public KanjiLessonDto getKanjiLessonById(Integer id) {
                return kanjiLessonRepository.findById(id)
                                .map(this::convertToDto)
                                .orElse(null);
        }

        private KanjiLessonDto convertToDto(KanjiLesson lesson) {
                return KanjiLessonDto.builder()
                                .lessonId(lesson.getId())
                                .lessonTitle(lesson.getTitle())
                                .icon(lesson.getIcon())
                                .displayOrder(lesson.getDisplayOrder())
                                .kanji(lesson.getKanjiList().stream()
                                                .map(this::convertKanjiToDto)
                                                .collect(Collectors.toList()))
                                .build();
        }

        private KanjiDto convertKanjiToDto(Kanji kanji) {
                return KanjiDto.builder()
                                .id(kanji.getId())
                                .kanji(kanji.getKanji())
                                .onReading(kanji.getOnReading())
                                .kunReading(kanji.getKunReading())
                                .hanViet(kanji.getHanViet())
                                .meaning(kanji.getMeaning())
                                .strokes(kanji.getStrokes())
                                .displayOrder(kanji.getDisplayOrder())
                                .compounds(kanji.getCompounds().stream()
                                                .map(this::convertCompoundToDto)
                                                .collect(java.util.stream.Collectors.toList()))
                                .build();
        }

        private KanjiCompoundDto convertCompoundToDto(KanjiCompound compound) {
                return KanjiCompoundDto.builder()
                                .id(compound.getId())
                                .word(compound.getWord())
                                .reading(compound.getReading())
                                .meaning(compound.getMeaning())
                                .displayOrder(compound.getDisplayOrder())
                                .build();
        }
}