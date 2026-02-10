package com.nekonihongo.backend.dto.kanji;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiLessonDTO {
    private Integer lessonId;
    private String lessonTitle;
    private String icon;
    private Integer displayOrder;
    private List<KanjiDTO> kanji;
}