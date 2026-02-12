package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.ExerciseDTO;
import com.nekonihongo.backend.dto.QuestionDTO;
import com.nekonihongo.backend.entity.*;
import com.nekonihongo.backend.enums.CategoryType;
import com.nekonihongo.backend.enums.JlptLevelType;
import com.nekonihongo.backend.exception.ResourceNotFoundException;
import com.nekonihongo.backend.repository.*;
import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final LevelCalculationService levelService;
    private final ActivityLogService activityLogService;
    private final ActivityLogRepository activityLogRepository;
    private final CategoryRepository categoryRepository;
    private final LevelRepository levelRepository;

    // ============ GENERIC METHOD - LẤY EXERCISE THEO CATEGORY & LEVEL ============

    public List<ExerciseDTO> getExercisesByCategoryAndLevel(CategoryType category, JlptLevelType level) {
        List<Exercise> exercises = exerciseRepository
                .findByCategory_NameAndLevel_LevelOrderByLessonNumberAsc(category, level);

        return exercises.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ============ DYNAMIC METHODS FOR SPECIFIC LEVELS ============

    // Vocabulary methods
    public List<ExerciseDTO> getN5VocabularyExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.VOCABULARY, JlptLevelType.N5);
    }

    public List<ExerciseDTO> getN4VocabularyExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.VOCABULARY, JlptLevelType.N4);
    }

    public List<ExerciseDTO> getN3VocabularyExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.VOCABULARY, JlptLevelType.N3);
    }

    public List<ExerciseDTO> getN2VocabularyExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.VOCABULARY, JlptLevelType.N2);
    }

    public List<ExerciseDTO> getN1VocabularyExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.VOCABULARY, JlptLevelType.N1);
    }

    // Grammar methods
    public List<ExerciseDTO> getN5GrammarExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.GRAMMAR, JlptLevelType.N5);
    }

    public List<ExerciseDTO> getN4GrammarExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.GRAMMAR, JlptLevelType.N4);
    }

    public List<ExerciseDTO> getN3GrammarExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.GRAMMAR, JlptLevelType.N3);
    }

    public List<ExerciseDTO> getN2GrammarExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.GRAMMAR, JlptLevelType.N2);
    }

    public List<ExerciseDTO> getN1GrammarExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.GRAMMAR, JlptLevelType.N1);
    }

    // Kanji methods
    public List<ExerciseDTO> getN5KanjiExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.KANJI, JlptLevelType.N5);
    }

    public List<ExerciseDTO> getN4KanjiExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.KANJI, JlptLevelType.N4);
    }

    public List<ExerciseDTO> getN3KanjiExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.KANJI, JlptLevelType.N3);
    }

    public List<ExerciseDTO> getN2KanjiExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.KANJI, JlptLevelType.N2);
    }

    public List<ExerciseDTO> getN1KanjiExercises() {
        return getExercisesByCategoryAndLevel(CategoryType.KANJI, JlptLevelType.N1);
    }

    // ============ CHECK AVAILABILITY ============

    public boolean hasExercises(CategoryType category, JlptLevelType level) {
        return exerciseRepository.existsByCategory_NameAndLevel_Level(category, level);
    }

    public long countExercises(CategoryType category, JlptLevelType level) {
        return exerciseRepository.countByCategory_NameAndLevel_Level(category, level);
    }

    // ============ EXERCISE BY ID ============

    public ExerciseDTO getExerciseById(Long id) {
        Exercise exercise = exerciseRepository.findByIdWithQuestions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài tập với ID: " + id));
        return mapToDTO(exercise);
    }

    // ============ IMPORT EXERCISES ============

    @Transactional
    public void importN5VocabularyExercises(List<Object> jsonData) {
        // Import logic here
    }

    @Transactional
    public void importExercises(CategoryType category, JlptLevelType level, List<ExerciseDTO> exercises) {
        // Bulk import logic
    }

    // ============ SUBMIT EXERCISE ============

    @Transactional
    public SubmitExerciseResult submitExercise(Long userId, SubmitExerciseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int oldPoints = user.getPoints();
        int oldLevel = user.getLevel();

        String exerciseTitle = getExerciseTitle(request);
        CategoryType exerciseType = request.getExerciseType() != null ? request.getExerciseType()
                : CategoryType.VOCABULARY;

        int pointsEarned = calculatePointsEarned(
                request.getCorrectAnswers(),
                request.getTotalQuestions(),
                request.getDifficultyLevel());

        int newPoints = oldPoints + pointsEarned;
        user.setPoints(newPoints);

        int newLevel = levelService.calculateLevel(newPoints);
        boolean leveledUp = newLevel > oldLevel;

        if (leveledUp) {
            user.setLevel(newLevel);
        }

        user.setLastLoginDate(LocalDateTime.now());
        userRepository.save(user);

        logActivityWithRetry(user, request, exerciseTitle, pointsEarned, newPoints,
                leveledUp, oldLevel, newLevel, exerciseType);

        LevelCalculationService.LevelInfo levelInfo = levelService.getLevelInfo(newPoints);

        SubmitExerciseResult result = SubmitExerciseResult.builder()
                .userId(userId)
                .pointsEarned(pointsEarned)
                .totalPoints(newPoints)
                .leveledUp(leveledUp)
                .oldLevel(oldLevel)
                .newLevel(newLevel)
                .levelInfo(levelInfo)
                .streak(user.getStreak())
                .message(getLevelUpMessage(leveledUp, oldLevel, newLevel))
                .exerciseType(exerciseType)
                .build();

        return result;
    }

    private String getExerciseTitle(SubmitExerciseRequest request) {
        if (request.getExerciseTitle() != null && !request.getExerciseTitle().isEmpty()) {
            return request.getExerciseTitle();
        }

        if (request.getExerciseId() != null) {
            try {
                Exercise exercise = exerciseRepository.findById(request.getExerciseId()).orElse(null);
                if (exercise != null) {
                    return exercise.getTitle();
                }
            } catch (Exception e) {
                // Log error
            }
        }

        return "Unknown Exercise";
    }

    private void logActivityWithRetry(
            User user,
            SubmitExerciseRequest request,
            String exerciseTitle,
            int pointsEarned,
            int newPoints,
            boolean leveledUp,
            int oldLevel,
            int newLevel,
            CategoryType exerciseType) {

        try {
            String action = buildActivityLogAction(
                    user.getUsername(),
                    exerciseTitle,
                    exerciseType,
                    request.getCorrectAnswers(),
                    request.getTotalQuestions(),
                    pointsEarned,
                    newPoints,
                    leveledUp,
                    oldLevel,
                    newLevel);

            for (int attempt = 1; attempt <= 3; attempt++) {
                try {
                    activityLogService.logActivity(user.getId(), action);
                    return;
                } catch (Exception e) {
                    if (attempt == 3) {
                        // Log error
                    }
                    Thread.sleep(100);
                }
            }
        } catch (Exception e) {
            // Log error
        }
    }

    private String buildActivityLogAction(
            String username,
            String exerciseTitle,
            CategoryType exerciseType,
            int correctAnswers,
            int totalQuestions,
            int pointsEarned,
            int totalPoints,
            boolean leveledUp,
            int oldLevel,
            int newLevel) {

        double percentage = totalQuestions > 0 ? (double) correctAnswers / totalQuestions * 100 : 0;
        String percentageStr = String.format("%.1f%%", percentage);

        StringBuilder action = new StringBuilder();
        action.append("📝 ").append(username).append(" - ");
        action.append("Hoàn thành: ").append(exerciseTitle);
        action.append(" (").append(exerciseType).append(")");
        action.append(" - Đúng: ").append(correctAnswers).append("/").append(totalQuestions);
        action.append(" (").append(percentageStr).append(")");
        action.append(" - Điểm: +").append(pointsEarned);
        action.append(" (Tổng: ").append(totalPoints).append(")");

        if (leveledUp) {
            action.append(" - 🎉 LEVEL UP: ").append(oldLevel).append(" → ").append(newLevel);
        } else {
            action.append(" - Level: ").append(oldLevel);
        }

        return action.toString();
    }

    private int calculatePointsEarned(int correctAnswers, int totalQuestions, int difficultyLevel) {
        if (totalQuestions == 0)
            return 0;

        double percentage = (double) correctAnswers / totalQuestions;
        int basePoints = (int) Math.round(percentage * 10);

        double multiplier = switch (difficultyLevel) {
            case 1 -> 1.0; // N5
            case 2 -> 1.2; // N4
            case 3 -> 1.5; // N3
            case 4 -> 2.0; // N2
            case 5 -> 3.0; // N1
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

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActivityDirectly(Long userId, String action) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found for logging"));

            ActivityLog activityLog = ActivityLog.builder()
                    .user(user)
                    .action(action)
                    .timestamp(LocalDateTime.now())
                    .build();

            activityLogRepository.save(activityLog);
            activityLogRepository.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to log activity", e);
        }
    }

    // ============ DTO MAPPING ============

    private ExerciseDTO mapToDTO(Exercise exercise) {
        List<QuestionDTO> questionDTOs = null;

        // Nếu exercise đã load questions (JOIN FETCH)
        if (exercise.getQuestions() != null && !exercise.getQuestions().isEmpty()) {
            questionDTOs = exercise.getQuestions().stream()
                    .sorted((q1, q2) -> q1.getDisplayOrder().compareTo(q2.getDisplayOrder()))
                    .map(this::mapToQuestionDTO)
                    .collect(Collectors.toList());
        }

        return ExerciseDTO.builder()
                .id(exercise.getId())
                .title(exercise.getTitle())
                .description(exercise.getDescription())
                .lessonNumber(exercise.getLessonNumber())
                .totalQuestions(exercise.getTotalQuestions())
                .questions(questionDTOs)
                .build();
    }

    private QuestionDTO mapToQuestionDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .displayOrder(question.getDisplayOrder())
                .questionText(question.getQuestionText())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .correctOption(question.getCorrectOption() != null ? question.getCorrectOption().name() : "")
                .explanation(question.getExplanation())
                .exerciseId(question.getExercise() != null ? question.getExercise().getId() : null)
                .build();
    }

    // ============ REQUEST/RESPONSE DTOs ============

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
        private String exerciseTitle;
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
        private CategoryType exerciseType;
    }
}