// src/main/java/com/nekonihongo/backend/service/KanjiService.java
package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.KanjiN5DTO;
import com.nekonihongo.backend.entity.KanjiN5;
import com.nekonihongo.backend.repository.KanjiN5Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // ← THÊM DÒNG NÀY – QUAN TRỌNG NHẤT!
@RequiredArgsConstructor
public class KanjiService {

    private final KanjiN5Repository kanjiN5Repository;

    public List<KanjiN5DTO> getKanjiN5() {
        List<KanjiN5> kanjiList = kanjiN5Repository.findAllByOrderByIdAsc();

        return kanjiList.stream()
                .map(k -> KanjiN5DTO.builder()
                        .id(k.getId())
                        .stt(k.getStt())
                        .kanji(k.getKanji())
                        .hanViet(k.getHanViet() != null ? k.getHanViet() : "-")
                        .meaning(k.getMeaning())
                        .onYomi(k.getOnYomi() != null ? k.getOnYomi() : "-")
                        .kunYomi(k.getKunYomi() != null ? k.getKunYomi() : "-")
                        .build())
                .toList();
    }
}