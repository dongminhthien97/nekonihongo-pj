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
import org.springframework.transaction.annotation.Propagation;

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
    private final ActivityLogService activityLogService;
    private final ActivityLogRepository activityLogRepository;
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

    @Transactional
    public SubmitExerciseResult submitExercise(Long userId, SubmitExerciseRequest request) {
        log.info("====== EXERCISE SUBMIT START ======");
        log.info("User ID: {}, Request: {}", userId, request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new RuntimeException("User not found");
                });

        log.info("User: {} (Points: {}, Level: {})",
                user.getUsername(), user.getPoints(), user.getLevel());

        int oldPoints = user.getPoints();
        int oldLevel = user.getLevel();

        // 1. Lấy thông tin bài tập
        String exerciseTitle = getExerciseTitle(request);
        log.info("Exercise title: {}", exerciseTitle);

        // 2. Tính điểm
        int pointsEarned = calculatePointsEarned(
                request.getCorrectAnswers(),
                request.getTotalQuestions(),
                request.getDifficultyLevel());
        log.info("Points earned: {}", pointsEarned);

        // 3. Cập nhật điểm
        int newPoints = oldPoints + pointsEarned;
        user.setPoints(newPoints);
        log.info("New points: {}", newPoints);

        // 4. Kiểm tra và cập nhật level
        int newLevel = levelService.calculateLevel(newPoints);
        boolean leveledUp = newLevel > oldLevel;
        log.info("New level: {}, Leveled up: {}", newLevel, leveledUp);

        if (leveledUp) {
            user.setLevel(newLevel);
            log.info("LEVEL UP! {} -> {}", oldLevel, newLevel);
        }

        // 5. Cập nhật last login
        user.setLastLoginDate(LocalDateTime.now());

        // 6. LƯU USER TRƯỚC KHI LOG ACTIVITY
        userRepository.save(user);
        log.info("User saved to database");

        // 7. LOG ACTIVITY - QUAN TRỌNG NHẤT
        logActivityWithRetry(user, request, exerciseTitle, pointsEarned, newPoints, leveledUp, oldLevel, newLevel);

        // 8. Lấy thông tin level
        LevelCalculationService.LevelInfo levelInfo = levelService.getLevelInfo(newPoints);

        // 9. Trả kết quả
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
                .build();

        log.info("====== EXERCISE SUBMIT END ======");
        return result;
    }

    /* ========== HELPER METHODS ========== */

    private String getExerciseTitle(SubmitExerciseRequest request) {
        String exerciseTitle = "Unknown Exercise";

        // Ưu tiên exerciseId
        if (request.getExerciseId() != null) {
            try {
                Exercise exercise = exerciseRepository.findById(request.getExerciseId()).orElse(null);
                if (exercise != null) {
                    exerciseTitle = exercise.getTitle();
                    log.info("Found exercise by ID {}: {}", request.getExerciseId(), exerciseTitle);
                }
            } catch (Exception e) {
                log.warn("Could not find exercise with id: {}", request.getExerciseId());
            }
        }

        // Fallback: dùng title từ request
        if (request.getExerciseTitle() != null && !request.getExerciseTitle().isEmpty()) {
            exerciseTitle = request.getExerciseTitle();
            log.info("Using exercise title from request: {}", exerciseTitle);
        }

        return exerciseTitle;
    }

    private void logActivityWithRetry(
            User user,
            SubmitExerciseRequest request,
            String exerciseTitle,
            int pointsEarned,
            int newPoints,
            boolean leveledUp,
            int oldLevel,
            int newLevel) {

        try {
            // Build action message
            String action = buildActivityLogAction(
                    user.getUsername(),
                    exerciseTitle,
                    request.getExerciseType(),
                    request.getCorrectAnswers(),
                    request.getTotalQuestions(),
                    pointsEarned,
                    newPoints,
                    leveledUp,
                    oldLevel,
                    newLevel);

            log.info("📝 Logging activity: {}", action);

            // Gọi activity log service với retry logic
            for (int attempt = 1; attempt <= 3; attempt++) {
                try {
                    log.info("📝 Attempt {} to log activity...", attempt);
                    activityLogService.logActivity(user.getId(), action);
                    log.info("✅ Activity logged successfully on attempt {}", attempt);
                    return; // Thành công, thoát
                } catch (Exception e) {
                    log.warn("⚠️ Attempt {} failed: {}", attempt, e.getMessage());
                    if (attempt == 3) {
                        log.error("❌ All attempts to log activity failed!");
                    }
                    // Chờ 100ms trước khi retry
                    Thread.sleep(100);
                }
            }

        } catch (Exception e) {
            log.error("❌ CRITICAL: Failed to log activity after all retries: {}", e.getMessage());
            // KHÔNG throw exception ở đây - không làm gián đoạn flow chính
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

        double percentage = (double) correctAnswers / totalQuestions * 100;
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
            case 1 -> 1.0; // Dễ
            case 2 -> 1.2; // Trung bình
            case 3 -> 1.5; // Khó
            case 4 -> 2.0; // Rất khó
            case 5 -> 3.0; // Thử thách
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

    /* ========== DIRECT LOGGING METHOD (fallback) ========== */

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActivityDirectly(Long userId, String action) {
        log.info("🔄 DIRECT LOGGING for user {}: {}", userId, action);

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found for logging"));

            ActivityLog activityLog = ActivityLog.builder()
                    .user(user)
                    .action(action)
                    .timestamp(LocalDateTime.now())
                    .build();

            // Sử dụng repository trực tiếp
            activityLogRepository.save(activityLog);
            activityLogRepository.flush(); // Force immediate save

            log.info("✅ DIRECT LOG saved with ID: {}", activityLog.getId());

        } catch (Exception e) {
            log.error("❌ DIRECT LOGGING failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Cần inject repository nếu dùng method trên
    // private final ActivityLogRepository activityLogRepository;

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
    }

    // Map to DTO method
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
}