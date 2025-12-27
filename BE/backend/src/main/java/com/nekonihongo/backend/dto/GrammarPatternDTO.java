// src/main/java/com/nekonihongo/backend/dto/GrammarPatternDTO.java
package com.nekonihongo.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrammarPatternDTO {
    private Long id;
    private String pattern;
    private String meaning;
    private String example;
    private String exampleMeaning;
}