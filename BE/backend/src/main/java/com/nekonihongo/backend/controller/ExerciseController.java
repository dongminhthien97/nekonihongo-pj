// ExerciseController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ExerciseDTO;
import com.nekonihongo.backend.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExerciseController {

    private final ExerciseService exerciseService;

    // Lấy danh sách bài tập N5 Vocabulary
    @GetMapping("/vocabulary/n5")
    public ResponseEntity<List<ExerciseDTO>> getN5VocabularyExercises() {
        List<ExerciseDTO> exercises = exerciseService.getN5VocabularyExercises();
        return ResponseEntity.ok(exercises);
    }

    // Lấy chi tiết 1 bài tập
    @GetMapping("/{id}")
    public ResponseEntity<ExerciseDTO> getExercise(@PathVariable("id") Long id) {
        ExerciseDTO exercise = exerciseService.getExerciseById(id);
        return ResponseEntity.ok(exercise);
    }

    @GetMapping("/grammar/n5")
    public List<ExerciseDTO> getN5GrammarExercises() {
        return exerciseService.getN5GrammarExercises();
    }

    @GetMapping("/kanji/n5")
    public List<ExerciseDTO> getN5KanjiExercises() {
        return exerciseService.getN5KanjiExercises();
    }

}