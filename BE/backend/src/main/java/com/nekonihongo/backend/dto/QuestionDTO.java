// QuestionDTO.java
package com.nekonihongo.backend.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private Long id;
    private int displayOrder;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption; // "A"|"B"|"C"|"D"
    private String explanation;
    private Long exerciseId;
}
