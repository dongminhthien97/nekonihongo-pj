package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.dto.ApiResponse;
import com.nekonihongo.backend.dto.ExerciseDTO;
import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.service.ExerciseService;
import com.nekonihongo.backend.service.impl.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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

        log.info("=== SUBMIT EXERCISE API CALLED ===");

        // 1. Check authentication
        if (userDetails == null) {
            log.error("UserDetails is null - User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Vui lòng đăng nhập để nộp bài tập"));
        }

        // 2. Lookup user by username/email
        String identifier = userDetails.getUsername();
        log.info("[LOOKUP] Đang tìm user với username/email: {}", identifier);

        Optional<User> userOpt = userService.findByUsernameOrEmailIgnoreCase(identifier);
        if (userOpt.isEmpty()) {
            log.error("User not found in database: {}", identifier);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy người dùng với username/email: " + identifier));
        }

        // 3. Submit exercise
        try {
            User currentUser = userOpt.get();
            ExerciseService.SubmitExerciseResult result = exerciseService.submitExercise(currentUser.getId(), request);

            return ResponseEntity.ok(ApiResponse.success("Nộp bài tập thành công!", result));

        } catch (Exception e) {
            log.error("❌ Unexpected error submitting exercise", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi server khi nộp bài tập: " + e.getMessage()));
        }
    }
}
