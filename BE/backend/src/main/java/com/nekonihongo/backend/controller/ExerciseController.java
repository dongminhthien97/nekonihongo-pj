package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.ExerciseDTO;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.ActivityLogRepository;
import com.nekonihongo.backend.service.ExerciseService;
import com.nekonihongo.backend.service.impl.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final UserService userService;
    private final ActivityLogRepository activityLogRepository; // Thêm để debug

    @GetMapping("/vocabulary/n5")
    public ResponseEntity<List<ExerciseDTO>> getN5VocabularyExercises() {
        return ResponseEntity.ok(exerciseService.getN5VocabularyExercises());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseDTO> getExercise(@PathVariable("id") Long id) {
        return ResponseEntity.ok(exerciseService.getExerciseById(id));
    }

    @GetMapping("/grammar/n5")
    public ResponseEntity<List<ExerciseDTO>> getN5GrammarExercises() {
        return ResponseEntity.ok(exerciseService.getN5GrammarExercises());
    }

    @GetMapping("/kanji/n5")
    public ResponseEntity<List<ExerciseDTO>> getN5KanjiExercises() {
        return ResponseEntity.ok(exerciseService.getN5KanjiExercises());
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<ExerciseService.SubmitExerciseResult>> submitExercise(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ExerciseService.SubmitExerciseRequest request) {

        log.info("====================== EXERCISE SUBMIT API ======================");
        log.info("📅 Time: {}", LocalDateTime.now());
        log.info("🔑 Authenticated user: {}", userDetails != null ? userDetails.getUsername() : "NULL");
        log.info("📋 Request: correct={}/{}, difficulty={}, type={}, exerciseId={}, exerciseTitle={}",
                request.getCorrectAnswers(), request.getTotalQuestions(),
                request.getDifficultyLevel(), request.getExerciseType(),
                request.getExerciseId(), request.getExerciseTitle());

        // 1. Check authentication
        if (userDetails == null) {
            log.error("❌ UserDetails is null - User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập để nộp bài tập"));
        }

        // 2. Lookup user by username/email
        String identifier = userDetails.getUsername();
        log.info("[LOOKUP] Đang tìm user với username/email: {}", identifier);

        Optional<User> userOpt = userService.findByUsernameOrEmailIgnoreCase(identifier);
        if (userOpt.isEmpty()) {
            log.error("❌ User not found in database: {}", identifier);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy người dùng với username/email: " + identifier));
        }

        // 3. Kiểm tra logs trước khi submit
        long logsBefore = activityLogRepository.count();
        log.info("📊 Logs trước khi submit: {}", logsBefore);

        // 4. Submit exercise
        try {
            User currentUser = userOpt.get();
            log.info("✅ User found: {} (ID: {}, Points: {}, Level: {})",
                    currentUser.getUsername(), currentUser.getId(),
                    currentUser.getPoints(), currentUser.getLevel());

            log.info("🔄 Gọi exerciseService.submitExercise...");
            ExerciseService.SubmitExerciseResult result = exerciseService.submitExercise(currentUser.getId(), request);
            log.info("✅ ExerciseService trả về kết quả");

            // 5. Kiểm tra logs sau khi submit (sau một chút delay)
            try {
                Thread.sleep(300); // Chờ transaction commit
                long logsAfter = activityLogRepository.count();
                log.info("📊 Logs sau khi submit: {} (Δ = {})", logsAfter, logsAfter - logsBefore);

                // Lấy log mới nhất để verify
                List<Object[]> latestLogs = activityLogRepository.findLatestLogWithUser();
                if (!latestLogs.isEmpty()) {
                    Object[] latest = latestLogs.get(0);
                    log.info("📝 Log mới nhất - ID: {}, User: {}, Action: {}, Time: {}",
                            latest[0], latest[1], latest[2], latest[3]);
                } else {
                    log.warn("⚠️ Không tìm thấy logs mới sau khi submit!");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            log.info(
                    "✅ Submit thành công! Kết quả: pointsEarned={}, totalPoints={}, leveledUp={}, oldLevel={}, newLevel={}",
                    result.getPointsEarned(), result.getTotalPoints(),
                    result.isLeveledUp(), result.getOldLevel(), result.getNewLevel());

            log.info("====================== SUBMIT COMPLETE ======================");
            return ResponseEntity.ok(ApiResponse.success("Nộp bài tập thành công!", result));

        } catch (Exception e) {
            log.error("❌ Lỗi khi submit exercise:", e);
            log.error("❌ Exception type: {}", e.getClass().getName());
            log.error("❌ Exception message: {}", e.getMessage());

            // Log stack trace để debug
            if (e.getCause() != null) {
                log.error("❌ Root cause: {}", e.getCause().getMessage());
            }

            log.info("====================== SUBMIT FAILED ======================");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server khi nộp bài tập: " + e.getMessage()));
        }
    }

    /* ========== DEBUG ENDPOINTS ========== */

    @GetMapping("/debug/logs/count")
    public ResponseEntity<ApiResponse<Long>> getLogCount() {
        try {
            long count = activityLogRepository.count();
            log.info("📊 Debug: Total activity logs = {}", count);
            return ResponseEntity.ok(ApiResponse.success("Total activity logs", count));
        } catch (Exception e) {
            log.error("Error getting log count: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/logs/latest")
    public ResponseEntity<ApiResponse<?>> getLatestLogs() {
        try {
            List<Object[]> logs = activityLogRepository.findLatestLogs(5);

            List<Object> result = logs.stream()
                    .map(log -> {
                        java.util.Map<String, Object> map = new java.util.HashMap<>();
                        map.put("id", log[0]);
                        map.put("userId", log[1]);
                        map.put("username", log[2]);
                        map.put("action", log[3]);
                        map.put("timestamp", log[4]);
                        return map;
                    })
                    .collect(java.util.stream.Collectors.toList());

            log.info("📊 Debug: Latest {} logs retrieved", logs.size());
            return ResponseEntity.ok(ApiResponse.success("Latest activity logs", result));
        } catch (Exception e) {
            log.error("Error getting latest logs: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/debug/test-log")
    public ResponseEntity<ApiResponse<String>> testLogCreation(
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Unauthorized"));
            }

            String identifier = userDetails.getUsername();
            Optional<User> userOpt = userService.findByUsernameOrEmailIgnoreCase(identifier);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();
            String testAction = "Test log from debug endpoint at " + LocalDateTime.now();

            // Tạo test log trực tiếp
            com.nekonihongo.backend.entity.ActivityLog testLog = com.nekonihongo.backend.entity.ActivityLog.builder()
                    .user(user)
                    .action(testAction)
                    .timestamp(LocalDateTime.now())
                    .build();

            activityLogRepository.save(testLog);
            activityLogRepository.flush(); // Force save

            log.info("✅ Test log created: ID = {}", testLog.getId());

            return ResponseEntity.ok(ApiResponse.success(
                    "Test log created successfully with ID: " + testLog.getId(),
                    testAction));

        } catch (Exception e) {
            log.error("❌ Test log creation failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error: " + e.getMessage()));
        }
    }
}