package com.nekonihongo.backend.dto.kanji;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiCompoundDTO {
    private Long id;
    private String word;
    private String reading;
    private String meaning;
    private Integer displayOrder;
}