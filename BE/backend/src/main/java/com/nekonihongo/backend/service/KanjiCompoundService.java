package com.nekonihongo.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nekonihongo.backend.dto.kanji.KanjiCompoundDto;
import com.nekonihongo.backend.entity.KanjiCompound;
import com.nekonihongo.backend.repository.KanjiCompoundRepository;

@Service
public class KanjiCompoundService {

    @Autowired
    private KanjiCompoundRepository kanjiCompoundRepository;

    @Transactional(readOnly = true)
    public List<KanjiCompoundDto> getCompoundsByKanjiId(Long kanjiId) {
        return kanjiCompoundRepository.findByKanjiIdOrderByDisplayOrder(kanjiId)
                .stream()
                .map(entity -> convertToDto(entity))
                .collect(Collectors.toList());
    }

    private KanjiCompoundDto convertToDto(KanjiCompound compound) {
        return KanjiCompoundDto.builder()
                .id(compound.getId())
                .word(compound.getWord())
                .reading(compound.getReading())
                .meaning(compound.getMeaning())
                .displayOrder(compound.getDisplayOrder())
                .build();
    }
}