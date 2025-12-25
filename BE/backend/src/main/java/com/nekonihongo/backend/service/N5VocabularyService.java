// src/main/java/com/neko/service/N5VocabularyService.java
package com.nekonihongo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nekonihongo.backend.dto.N5VocabularyDTO;
import com.nekonihongo.backend.entity.N5Vocabulary;
import com.nekonihongo.backend.repository.N5VocabularyRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class N5VocabularyService {

    private final N5VocabularyRepository repository;

    /**
     * Lấy tất cả từ vựng N5 với phân trang
     */
    public Page<N5VocabularyDTO> getAllN5(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<N5Vocabulary> result = repository.findAll(pageable);

        return result.map(this::toDTO);
    }

    /**
     * Tìm kiếm từ vựng N5 theo query (tuVung, hanTu, tiengViet)
     */
    public Page<N5VocabularyDTO> searchN5(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<N5Vocabulary> result = repository.searchByQuery(query, pageable);

        return result.map(this::toDTO);
    }

    /**
     * Lấy tổng số từ N5
     */
    public long getTotalCount() {
        return repository.count();
    }

    /**
     * Convert Entity → DTO
     */
    private N5VocabularyDTO toDTO(N5Vocabulary entity) {
        return N5VocabularyDTO.builder()
                .stt(entity.getStt())
                .tuVung(entity.getTuVung())
                .hanTu(entity.getHanTu())
                .tiengViet(entity.getTiengViet())
                .viDu(entity.getViDu())
                .build();
    }
}