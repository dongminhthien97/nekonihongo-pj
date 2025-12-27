// ExerciseService.java
package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.ExerciseDTO;
import com.nekonihongo.backend.dto.QuestionDTO;
import com.nekonihongo.backend.entity.*;
import com.nekonihongo.backend.enums.CategoryType;
import com.nekonihongo.backend.enums.JlptLevelType;
import com.nekonihongo.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final QuestionRepository questionRepository;

    // Lấy danh sách bài tập N5 Vocabulary – FIX CHÍNH TẠI ĐÂY
    public List<ExerciseDTO> getN5VocabularyExercises() {
        List<Exercise> exercises = exerciseRepository
                .findByCategory_NameAndLevel_LevelOrderByLessonNumber(
                        CategoryType.VOCABULARY, // ← Dùng enum thay vì String
                        JlptLevelType.N5 // ← Dùng enum thay vì String
                );

        return exercises.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết 1 bài tập (với câu hỏi)
    public ExerciseDTO getExerciseById(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập"));

        return mapToDTO(exercise);
    }

    private ExerciseDTO mapToDTO(Exercise exercise) {
        List<Question> questions = questionRepository
                .findByExercise_IdOrderByDisplayOrder(exercise.getId());

        List<QuestionDTO> questionDTOs = questions.stream()
                .map(q -> QuestionDTO.builder()
                        .displayOrder(q.getDisplayOrder())
                        .questionText(q.getQuestionText()) // ← frontend dùng questionText
                        .optionA(q.getOptionA()) // ← riêng từng option
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .correctOption(switch (q.getCorrectOption()) {
                            case A -> "A";
                            case B -> "B";
                            case C -> "C";
                            case D -> "D";
                        })
                        .explanation(q.getExplanation())
                        .build())
                .collect(Collectors.toList());

        return ExerciseDTO.builder()
                .id(exercise.getId())
                .title(exercise.getTitle())
                .description(exercise.getDescription())
                .lessonNumber(exercise.getLessonNumber())
                .totalQuestions(exercise.getTotalQuestions())
                .questions(questionDTOs)
                .build();
    }

    public List<ExerciseDTO> getN5GrammarExercises() {
        List<Exercise> exercises = exerciseRepository
                .findByCategory_NameAndLevel_LevelOrderByLessonNumber(
                        CategoryType.GRAMMAR,
                        JlptLevelType.N5);

        return exercises.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ExerciseDTO> getN5KanjiExercises() {
        List<Exercise> exercises = exerciseRepository
                .findByCategory_NameAndLevel_LevelOrderByLessonNumber(
                        CategoryType.KANJI,
                        JlptLevelType.N5);

        return exercises.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Import từ JSON (sau này dùng)
    @Transactional
    public void importN5VocabularyExercises(List<Object> jsonData) {
        // Logic import từ JSON (59 bài)
        // Sẽ viết chi tiết khi có full JSON
    }

}