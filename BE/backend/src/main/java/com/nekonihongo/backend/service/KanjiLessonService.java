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
        List<KanjiLesson> lessons = kanjiLessonRepository.findAllWithKanji();

        return lessons.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public KanjiLessonDto getKanjiLessonById(Integer id) {
        return kanjiLessonRepository.findById(id)
                .map(this::convertToDto)
                .orElse(null);
    }

    private KanjiLessonDto convertToDto(KanjiLesson lesson) {
        KanjiLessonDto dto = new KanjiLessonDto();
        dto.setId(lesson.getId());
        dto.setTitle(lesson.getTitle());
        dto.setIcon(lesson.getIcon());
        dto.setKanjiList(lesson.getKanjiList().stream()
                .map(this::convertKanjiToDto)
                .collect(Collectors.toList()));
        return dto;
    }

    private KanjiDto convertKanjiToDto(Kanji kanji) {
        KanjiDto dto = new KanjiDto();
        dto.setKanji(kanji.getKanji());
        dto.setOn(kanji.getOnReading());
        dto.setKun(kanji.getKunReading());
        dto.setHanViet(kanji.getHanViet());
        dto.setMeaning(kanji.getMeaning());
        dto.setStrokes(kanji.getStrokes());
        dto.setCompounds(kanji.getCompounds().stream()
                .map(this::convertCompoundToDto)
                .collect(Collectors.toList()));
        return dto;
    }

    private KanjiCompoundDto convertCompoundToDto(KanjiCompound compound) {
        KanjiCompoundDto dto = new KanjiCompoundDto();
        dto.setWord(compound.getWord());
        dto.setReading(compound.getReading());
        dto.setMeaning(compound.getMeaning());
        return dto;
    }
}