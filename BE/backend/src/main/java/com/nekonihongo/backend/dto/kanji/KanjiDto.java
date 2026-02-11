package com.nekonihongo.backend.dto.kanji;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiDto {
    private Long id;
    private String kanji;
    private String onReading;
    private String kunReading;
    private String hanViet;
    private String meaning;
    private Integer strokes;
    private Integer displayOrder;
    private List<KanjiCompoundDto> compounds;
}
