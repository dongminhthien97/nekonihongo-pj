package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.ExerciseDTO;
import com.nekonihongo.backend.dto.QuestionDTO;
import com.nekonihongo.backend.entity.*;
import com.nekonihongo.backend.enums.CategoryType;
import com.nekonihongo.backend.enums.JlptLevelType;
import com.nekonihongo.backend.repository.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final LevelCalculationService levelService;

    /* ========== GET EXERCISES (KEEP EXISTING LOGIC) ========== */

    public List<ExerciseDTO> getN5VocabularyExercises() {
        List<Exercise> exercises = exerciseRepository
                .findByCategory_NameAndLevel_LevelOrderByLessonNumber(
                        CategoryType.VOCABULARY,
                        JlptLevelType.N5);
        return exercises.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ExerciseDTO getExerciseById(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập"));
        return mapToDTO(exercise);
    }

    public List<ExerciseDTO> getN5GrammarExercises() {
        List<Exercise> exercises = exerciseRepository
                .findByCategory_NameAndLevel_LevelOrderByLessonNumber(
                        CategoryType.GRAMMAR,
                        JlptLevelType.N5);
        return exercises.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<ExerciseDTO> getN5KanjiExercises() {
        List<Exercise> exercises = exerciseRepository
                .findByCategory_NameAndLevel_LevelOrderByLessonNumber(
                        CategoryType.KANJI,
                        JlptLevelType.N5);
        return exercises.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void importN5VocabularyExercises(List<Object> jsonData) {
        // Logic import từ JSON (giữ nguyên)
    }

    /* ========== NEW: SUBMIT EXERCISE LOGIC ========== */

    @Transactional
    public SubmitExerciseResult submitExercise(Long userId, SubmitExerciseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int oldPoints = user.getPoints();
        int oldLevel = user.getLevel();

        // 1. Tính điểm
        int pointsEarned = calculatePointsEarned(
                request.getCorrectAnswers(),
                request.getTotalQuestions(),
                request.getDifficultyLevel());

        // 2. Cập nhật điểm
        int newPoints = oldPoints + pointsEarned;
        user.setPoints(newPoints);

        // 3. Kiểm tra và cập nhật level
        int newLevel = levelService.calculateLevel(newPoints);
        boolean leveledUp = newLevel > oldLevel;

        if (leveledUp) {
            user.setLevel(newLevel);
            log.info("User {} leveled up: {} -> {}", userId, oldLevel, newLevel);
        }

        // 4. Cập nhật thời gian (cho streak nếu cần)
        user.setLastLoginDate(LocalDateTime.now());

        userRepository.save(user);

        // 5. Lấy thông tin level chi tiết
        LevelCalculationService.LevelInfo levelInfo = levelService.getLevelInfo(newPoints);

        // 6. Trả kết quả
        return SubmitExerciseResult.builder()
                .userId(userId)
                .pointsEarned(pointsEarned)
                .totalPoints(newPoints)
                .leveledUp(leveledUp)
                .oldLevel(oldLevel)
                .newLevel(newLevel)
                .levelInfo(levelInfo)
                .streak(user.getStreak())
                .message(getLevelUpMessage(leveledUp, oldLevel, newLevel))
                .build();
    }

    /* ========== HELPER METHODS ========== */

    private int calculatePointsEarned(int correctAnswers, int totalQuestions, int difficultyLevel) {
        if (totalQuestions == 0)
            return 0;

        double percentage = (double) correctAnswers / totalQuestions;
        int basePoints = (int) Math.round(percentage * 10); // 0-10 điểm

        // Hệ số độ khó
        double multiplier = switch (difficultyLevel) {
            case 1 -> 1.0;
            case 2 -> 1.2;
            case 3 -> 1.5;
            case 4 -> 2.0;
            case 5 -> 3.0;
            default -> 1.0;
        };

        return (int) Math.round(basePoints * multiplier);
    }

    private String getLevelUpMessage(boolean leveledUp, int oldLevel, int newLevel) {
        if (!leveledUp) {
            return "Tiếp tục cố gắng nhé!";
        }

        if (newLevel - oldLevel > 1) {
            return String.format("Wow! Bạn đã leo %d cấp một lúc! 🚀", newLevel - oldLevel);
        }

        return String.format("Chúc mừng! Bạn đã lên Level %d! 🎉", newLevel);
    }

    private ExerciseDTO mapToDTO(Exercise exercise) {
        List<Question> questions = questionRepository
                .findByExercise_IdOrderByDisplayOrder(exercise.getId());

        List<QuestionDTO> questionDTOs = questions.stream()
                .map(q -> QuestionDTO.builder()
                        .displayOrder(q.getDisplayOrder())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
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

    /* ========== DTOs ========== */

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitExerciseRequest {
        private int correctAnswers;
        private int totalQuestions;
        private int difficultyLevel;
        private CategoryType exerciseType;
        private Long exerciseId;
    }

    @Data
    @Builder
    public static class SubmitExerciseResult {
        private Long userId;
        private int pointsEarned;
        private int totalPoints;
        private boolean leveledUp;
        private int oldLevel;
        private int newLevel;
        private LevelCalculationService.LevelInfo levelInfo;
        private int streak;
        private String message;
    }
}