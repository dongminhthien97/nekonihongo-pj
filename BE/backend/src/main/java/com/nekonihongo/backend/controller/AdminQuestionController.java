// src/main/java/com/nekonihongo/backend/controller/AdminQuestionController.java
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.entity.GrammarQuestion;
import com.nekonihongo.backend.repository.GrammarQuestionRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/questions")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionController {

    private final GrammarQuestionRepository grammarQuestionRepository;

    /**
     * Lấy danh sách câu hỏi theo lessonId để chấm điểm
     */
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<?> getQuestionsByLesson(@PathVariable(name = "lessonId") Integer lessonId) {
        try {
            log.info("Fetching questions for lessonId: {}", lessonId);

            List<GrammarQuestion> questions = grammarQuestionRepository.findByLessonId(lessonId);

            if (questions.isEmpty()) {
                log.warn("No questions found for lessonId: {}", lessonId);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", Collections.emptyList(),
                        "message", "No questions found for this lesson"));
            }

            // Transform to simplified DTO
            List<Map<String, Object>> questionDTOs = questions.stream()
                    .map(this::convertToQuestionDTO)
                    .collect(Collectors.toList());

            log.info("Found {} questions for lessonId: {}", questions.size(), lessonId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", questionDTOs,
                    "count", questions.size()));
        } catch (Exception e) {
            log.error("Error getting questions for lessonId {}: ", lessonId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error getting questions: " + e.getMessage()));
        }
    }

    /**
     * Đánh giá câu trả lời của học viên
     */
    @PostMapping("/evaluate-answers")
    public ResponseEntity<?> evaluateAnswers(@RequestBody EvaluateAnswersRequest request) {
        try {
            log.info("Evaluating answers for lessonId: {}", request.getLessonId());

            List<GrammarQuestion> questions = grammarQuestionRepository.findByLessonId(request.getLessonId());
            Map<Long, GrammarQuestion> questionMap = questions.stream()
                    .collect(Collectors.toMap(GrammarQuestion::getId, q -> q));

            List<EvaluatedAnswer> evaluatedAnswers = new ArrayList<>();
            int totalScore = 0;
            int maxPossibleScore = 0;

            // Nhóm câu trả lời theo questionId để xử lý nhiều câu con
            Map<Long, List<UserAnswer>> answersByQuestion = request.getUserAnswers().stream()
                    .collect(Collectors.groupingBy(UserAnswer::getQuestionId));

            for (Map.Entry<Long, List<UserAnswer>> entry : answersByQuestion.entrySet()) {
                Long questionId = entry.getKey();
                List<UserAnswer> userAnswersForQuestion = entry.getValue();
                GrammarQuestion question = questionMap.get(questionId);

                if (question != null) {
                    maxPossibleScore += question.getPoints();

                    // Tách đáp án đúng bằng dấu ;
                    String[] correctAnswers = question.getCorrectAnswer().split(";");

                    // Xử lý từng câu trả lời cho câu hỏi này
                    for (int i = 0; i < userAnswersForQuestion.size(); i++) {
                        UserAnswer userAnswer = userAnswersForQuestion.get(i);

                        // Xác định subQuestionIndex
                        int subQuestionIndex = userAnswer.getSubQuestionIndex() != null
                                ? userAnswer.getSubQuestionIndex()
                                : i;

                        // Đảm bảo index trong phạm vi
                        if (subQuestionIndex >= correctAnswers.length) {
                            subQuestionIndex = i % correctAnswers.length;
                        }

                        boolean isCorrect = evaluateAnswer(
                                userAnswer.getUserAnswer(),
                                question,
                                subQuestionIndex);

                        int points = isCorrect ? (question.getPoints() / correctAnswers.length) : 0;
                        totalScore += points;

                        // Lấy đáp án đúng cho câu con này
                        String correctForSubQuestion = (subQuestionIndex < correctAnswers.length)
                                ? correctAnswers[subQuestionIndex].trim()
                                : correctAnswers[0].trim();

                        evaluatedAnswers.add(EvaluatedAnswer.builder()
                                .questionId(questionId)
                                .userAnswer(userAnswer.getUserAnswer())
                                .isCorrect(isCorrect)
                                .correctAnswer(correctForSubQuestion)
                                .allCorrectAnswers(question.getCorrectAnswer())
                                .subQuestionIndex(subQuestionIndex)
                                .points(points)
                                .maxPoints(question.getPoints() / correctAnswers.length)
                                .explanation(question.getExplanation())
                                .questionType(question.getType().name())
                                .questionText(question.getText())
                                .build());
                    }
                } else {
                    log.warn("Question not found for ID: {}", questionId);
                    for (UserAnswer userAnswer : userAnswersForQuestion) {
                        evaluatedAnswers.add(EvaluatedAnswer.builder()
                                .questionId(questionId)
                                .userAnswer(userAnswer.getUserAnswer())
                                .isCorrect(false)
                                .correctAnswer("Câu hỏi không tồn tại")
                                .allCorrectAnswers("")
                                .subQuestionIndex(userAnswer.getSubQuestionIndex())
                                .points(0)
                                .maxPoints(0)
                                .explanation("Không tìm thấy câu hỏi trong database")
                                .questionType("unknown")
                                .questionText("")
                                .build());
                    }
                }
            }

            // Sắp xếp theo questionId và subQuestionIndex
            evaluatedAnswers.sort(Comparator
                    .comparing(EvaluatedAnswer::getQuestionId)
                    .thenComparing(EvaluatedAnswer::getSubQuestionIndex));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalScore", totalScore);
            response.put("maxPossibleScore", maxPossibleScore);
            response.put("percentage",
                    maxPossibleScore > 0 ? Math.round((double) totalScore / maxPossibleScore * 100) : 0);
            response.put("evaluatedAnswers", evaluatedAnswers);
            response.put("lessonId", request.getLessonId());

            log.info("Evaluation completed. Score: {}/{} ({}%)",
                    totalScore, maxPossibleScore,
                    maxPossibleScore > 0 ? Math.round((double) totalScore / maxPossibleScore * 100) : 0);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error evaluating answers: ", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error evaluating answers: " + e.getMessage()));
        }
    }

    /**
     * Lấy câu hỏi theo ID (cho chi tiết)
     */
    @GetMapping("/{questionId}")
    public ResponseEntity<?> getQuestionById(@PathVariable(name = "questionId") Long questionId) {
        try {
            Optional<GrammarQuestion> questionOpt = grammarQuestionRepository.findById(questionId);

            if (questionOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Question not found"));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", convertToQuestionDTO(questionOpt.get())));
        } catch (Exception e) {
            log.error("Error getting question {}: ", questionId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error getting question"));
        }
    }

    @GetMapping("/lesson/{lessonId}/correct-answers")
    public ResponseEntity<?> getCorrectAnswersByLesson(@PathVariable(name = "lessonId") Integer lessonId) {
        try {
            log.info("Getting correct answers for lesson: {}", lessonId);

            List<GrammarQuestion> questions = grammarQuestionRepository.findByLessonId(lessonId);

            if (questions.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", List.of(),
                        "message", "No questions found for this lesson"));
            }

            // Tạo DTO đơn giản chỉ chứa thông tin cần thiết
            List<Map<String, Object>> questionAnswers = questions.stream()
                    .map(q -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", q.getId());
                        map.put("lessonId", q.getLessonId());
                        map.put("type", q.getType().name()); // Sẽ trả về "fill_blank", "multiple_choice", "rearrange"
                        map.put("text", q.getText());
                        map.put("correctAnswer", q.getCorrectAnswer());
                        map.put("points", q.getPoints());
                        map.put("explanation", q.getExplanation());

                        // Phân tích đáp án đúng theo loại câu hỏi
                        GrammarQuestion.QuestionType questionType = q.getType();

                        if (questionType == GrammarQuestion.QuestionType.fill_blank) {
                            // Fill blank: tách thành mảng các đáp án
                            String[] parts = q.getCorrectAnswer().split(";");
                            map.put("answerParts", Arrays.asList(parts));
                            map.put("numParts", parts.length);
                        } else if (questionType == GrammarQuestion.QuestionType.multiple_choice) {
                            // Multiple choice: tách các đáp án đúng
                            String[] parts = q.getCorrectAnswer().split(";");
                            map.put("answerParts", Arrays.asList(parts));
                        }
                        // Rearrange không cần phân tích đặc biệt

                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", questionAnswers,
                    "count", questions.size()));
        } catch (Exception e) {
            log.error("Error getting correct answers for lesson {}: ", lessonId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error getting correct answers: " + e.getMessage()));
        }
    }

    /**
     * Logic đánh giá câu trả lời
     */
    private boolean evaluateAnswer(String userAnswer, GrammarQuestion question, int subQuestionIndex) {
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return false;
        }

        String normalizedUser = userAnswer.trim().toLowerCase();
        String normalizedCorrect = question.getCorrectAnswer().trim().toLowerCase();

        // Sử dụng giá trị enum đúng từ entity
        GrammarQuestion.QuestionType type = question.getType();

        // DEBUG: log để xem loại câu hỏi
        log.debug("Evaluating question type: {}, correct answer: {}", type, normalizedCorrect);

        if (type == GrammarQuestion.QuestionType.fill_blank) {
            return evaluateFillBlankAnswer(normalizedUser, normalizedCorrect, subQuestionIndex);
        } else if (type == GrammarQuestion.QuestionType.multiple_choice) {
            return evaluateMultipleChoiceAnswer(normalizedUser, normalizedCorrect);
        } else if (type == GrammarQuestion.QuestionType.rearrange) {
            return evaluateRearrangeAnswer(normalizedUser, normalizedCorrect);
        } else {
            return normalizedUser.equals(normalizedCorrect);
        }
    }

    /**
     * Đánh giá câu hỏi fill_blank: Mỗi chỗ trống (x) tương ứng với một đáp án phân
     * cách bằng dấu ;
     */
    private boolean evaluateFillBlankAnswer(String userAnswer, String correctAnswers, int subQuestionIndex) {
        // Tách các đáp án đúng bằng dấu ;
        String[] allCorrectAnswers = correctAnswers.split(";");

        // Đảm bảo subQuestionIndex hợp lệ
        if (subQuestionIndex < 0 || subQuestionIndex >= allCorrectAnswers.length) {
            return false;
        }

        // Lấy đáp án đúng cho chỗ trống này
        String correctForThisBlank = allCorrectAnswers[subQuestionIndex].trim();

        // Mỗi đáp án có thể có nhiều lựa chọn đúng, phân cách bằng |
        String[] possibleAnswers = correctForThisBlank.split("\\|");

        // Chuẩn hóa câu trả lời của user
        String normalizedUser = userAnswer.trim();

        // So sánh với từng lựa chọn đúng
        for (String possible : possibleAnswers) {
            String normalizedPossible = possible.trim();

            // Fill blank: có thể chấp nhận sai số nhỏ
            if (normalizedUser.equals(normalizedPossible)) {
                return true;
            }

            // Hoặc nếu đáp án chứa user answer (cho độ linh hoạt)
            if (normalizedUser.contains(normalizedPossible) || normalizedPossible.contains(normalizedUser)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Đánh giá câu hỏi multiple_choice: Đáp án là string chứa các đáp án đúng phân
     * cách bằng ;
     */
    private boolean evaluateMultipleChoiceAnswer(String userAnswer, String correctAnswers) {
        try {
            // Đối với multiple_choice, correctAnswers là string chứa các đáp án đúng phân
            // cách bằng ;
            String[] allCorrectAnswers = correctAnswers.split(";");

            // Chuẩn hóa câu trả lời của user
            String normalizedUser = userAnswer.trim();

            // Multiple choice yêu cầu chính xác 100%
            for (String correct : allCorrectAnswers) {
                if (normalizedUser.equals(correct.trim())) {
                    return true;
                }
            }

            return false;
        } catch (Exception e) {
            log.error("Error evaluating multiple choice answer: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Đánh giá câu hỏi rearrange: Đáp án là chuỗi đầy đủ đã sắp xếp đúng
     */
    private boolean evaluateRearrangeAnswer(String userAnswer, String correctAnswer) {
        // Rearrange yêu cầu chính xác tuyệt đối
        String normalizedUser = userAnswer.trim();
        String normalizedCorrect = correctAnswer.trim();

        // So sánh chính xác
        return normalizedUser.equals(normalizedCorrect);
    }

    private String getCorrectAnswerForSubQuestion(String allCorrectAnswers,
            GrammarQuestion.QuestionType type,
            int subQuestionIndex) {
        if (type == GrammarQuestion.QuestionType.fill_blank) {
            String[] parts = allCorrectAnswers.split(";");
            if (subQuestionIndex >= 0 && subQuestionIndex < parts.length) {
                return parts[subQuestionIndex].trim();
            }
        }

        return allCorrectAnswers;
    }

    private boolean compareSingleAnswer(String userAnswer, String correctAnswer, GrammarQuestion.QuestionType type) {
        if (type == GrammarQuestion.QuestionType.multiple_choice) {
            return userAnswer.equals(correctAnswer);
        } else if (type == GrammarQuestion.QuestionType.fill_blank) {
            // Fill blank: có thể có nhiều đáp án đúng cho một chỗ trống, phân cách bằng |
            String[] possibleAnswers = correctAnswer.split("\\|");
            return Arrays.stream(possibleAnswers)
                    .map(String::trim)
                    .anyMatch(correct -> userAnswer.equals(correct) ||
                            userAnswer.contains(correct) ||
                            correct.contains(userAnswer));
        } else if (type == GrammarQuestion.QuestionType.rearrange) {
            return userAnswer.equals(correctAnswer);
        } else {
            return userAnswer.equals(correctAnswer);
        }
    }

    /**
     * Convert entity to DTO
     */
    private Map<String, Object> convertToQuestionDTO(GrammarQuestion question) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", question.getId());
        dto.put("lessonId", question.getLessonId());
        dto.put("type", question.getType().name());
        dto.put("example", question.getExample());
        dto.put("text", question.getText());
        dto.put("options", question.getOptions());
        dto.put("correctAnswer", question.getCorrectAnswer());
        dto.put("points", question.getPoints());
        dto.put("explanation", question.getExplanation());
        dto.put("createdAt", question.getCreatedAt());
        dto.put("updatedAt", question.getUpdatedAt());
        return dto;
    }

    // Inner classes for request/response
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvaluateAnswersRequest {
        private Integer lessonId;
        private List<UserAnswer> userAnswers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAnswer {
        private Long questionId;
        private String userAnswer;
        private Integer subQuestionIndex;
        private String originalAnswer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvaluatedAnswer {
        private Long questionId;
        private String userAnswer;
        private Boolean isCorrect;
        private String correctAnswer;
        private String allCorrectAnswers;
        private Integer subQuestionIndex;
        private Integer points;
        private Integer maxPoints;
        private String explanation;
        private String questionType;
        private String questionText;
    }
}