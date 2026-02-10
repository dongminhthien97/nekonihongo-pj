package com.nekonihongo.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nekonihongo.backend.dto.kanji.KanjiCompoundDTO;
import com.nekonihongo.backend.dto.kanji.KanjiDTO;
import com.nekonihongo.backend.dto.kanji.KanjiLessonDTO;
import com.nekonihongo.backend.entity.Kanji;
import com.nekonihongo.backend.entity.KanjiCompound;
import com.nekonihongo.backend.entity.KanjiLesson;
import com.nekonihongo.backend.repository.KanjiLessonRepository;

@Service
public class KanjiLessonService {

    @Autowired
    private KanjiLessonRepository kanjiLessonRepository;

    @Transactional(readOnly = true)
    public List<KanjiLessonDTO> getAllLessonsWithKanji() {
        List<KanjiLesson> lessons = kanjiLessonRepository.findAllWithKanjiOnly();

        return lessons.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public KanjiLessonDTO getKanjiLessonById(Integer id) {
        return kanjiLessonRepository.findById(id)
                .map(this::convertToDto)
                .orElse(null);
    }

    private KanjiLessonDTO convertToDto(KanjiLesson lesson) {
        return KanjiLessonDTO.builder()
                .lessonId(lesson.getId())
                .lessonTitle(lesson.getTitle())
                .icon(lesson.getIcon())
                .displayOrder(lesson.getDisplayOrder())
                .kanji(lesson.getKanjiList().stream()
                        .map(this::convertKanjiToDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private KanjiDTO convertKanjiToDto(Kanji kanji) {
        return KanjiDTO.builder()
                .id(kanji.getId())
                .kanji(kanji.getKanji())
                .onReading(kanji.getOnReading())
                .kunReading(kanji.getKunReading())
                .hanViet(kanji.getHanViet())
                .meaning(kanji.getMeaning())
                .strokes(kanji.getStrokes())
                .displayOrder(kanji.getDisplayOrder())
                .build();
    }
}