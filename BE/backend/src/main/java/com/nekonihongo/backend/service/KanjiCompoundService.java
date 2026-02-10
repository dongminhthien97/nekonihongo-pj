package com.nekonihongo.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nekonihongo.backend.dto.kanji.KanjiCompoundDTO;
import com.nekonihongo.backend.entity.KanjiCompound;
import com.nekonihongo.backend.repository.KanjiCompoundRepository;

@Service
public class KanjiCompoundService {

    @Autowired
    private KanjiCompoundRepository kanjiCompoundRepository;

    @Transactional(readOnly = true)
    public List<KanjiCompoundDTO> getCompoundsByKanjiId(Long kanjiId) {
        return kanjiCompoundRepository.findByKanjiIdOrderByDisplayOrder(kanjiId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private KanjiCompoundDTO convertToDto(KanjiCompound compound) {
        return KanjiCompoundDTO.builder()
                .id(compound.getId())
                .word(compound.getWord())
                .reading(compound.getReading())
                .meaning(compound.getMeaning())
                .displayOrder(compound.getDisplayOrder())
                .build();
    }
}