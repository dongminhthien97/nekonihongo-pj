// KanjiN5DTO.java
package com.nekonihongo.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiN5DTO {
    private Long id;
    private String stt;
    private String kanji;
    private String hanViet;
    private String meaning;
    private String onYomi;
    private String kunYomi;
}