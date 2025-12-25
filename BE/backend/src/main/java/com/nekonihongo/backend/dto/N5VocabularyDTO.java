package com.nekonihongo.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class N5VocabularyDTO {
    private String level;
    private String stt;
    private String tuVung;
    private String hanTu;
    private String tiengViet; // tên đúng theo JSON
    private String viDu;
}