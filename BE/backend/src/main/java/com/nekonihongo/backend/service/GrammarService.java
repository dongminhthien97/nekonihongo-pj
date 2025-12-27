// GrammarService.java
package com.nekonihongo.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import com.nekonihongo.backend.dto.GrammarPatternDTO;
import com.nekonihongo.backend.repository.GrammarPatternRepository;
import com.nekonihongo.backend.entity.GrammarPattern;

import lombok.RequiredArgsConstructor;

// GrammarService.java
@Service
@RequiredArgsConstructor
public class GrammarService {

    private final GrammarPatternRepository grammarPatternRepository;

    public List<GrammarPatternDTO> getN5GrammarPatterns() {
        List<GrammarPattern> patterns = grammarPatternRepository.findAllByOrderByIdAsc();

        return patterns.stream()
                .map(p -> GrammarPatternDTO.builder()
                        .id(p.getId())
                        .pattern(p.getPattern())
                        .meaning(p.getMeaning())
                        .example(p.getExample())
                        .exampleMeaning(p.getExampleMeaning())
                        .build())
                .toList();
    }
}