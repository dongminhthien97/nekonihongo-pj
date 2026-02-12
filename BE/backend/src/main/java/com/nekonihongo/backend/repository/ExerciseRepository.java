package com.nekonihongo.backend.repository;

import com.nekonihongo.backend.entity.Exercise;
import com.nekonihongo.backend.enums.CategoryType;
import com.nekonihongo.backend.enums.JlptLevelType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

        // Lấy bài tập theo category và level
        List<Exercise> findByCategory_NameAndLevel_LevelOrderByLessonNumberAsc(
                        CategoryType categoryName,
                        JlptLevelType levelName);

        // Lấy bài tập theo category (không cần level)
        List<Exercise> findByCategory_NameOrderByLessonNumberAsc(String categoryName);

        // Lấy bài tập theo level
        List<Exercise> findByLevel_LevelOrderByLessonNumberAsc(JlptLevelType levelName);

        // Kiểm tra xem có bài tập nào cho category và level không
        boolean existsByCategory_NameAndLevel_Level(CategoryType categoryName, JlptLevelType levelName);

        // Đếm số bài tập theo category và level
        long countByCategory_NameAndLevel_Level(CategoryType categoryName, JlptLevelType levelName);

        // Lấy bài tập kèm câu hỏi (JOIN FETCH)
        @Query("SELECT DISTINCT e FROM Exercise e " +
                        "LEFT JOIN FETCH e.questions q " +
                        "WHERE e.category.name = :category AND e.level.level = :level " +
                        "ORDER BY e.lessonNumber ASC, q.displayOrder ASC")
        List<Exercise> findExercisesWithQuestionsByCategoryAndLevel(
                        @Param("category") CategoryType category,
                        @Param("level") JlptLevelType level);

        // Tìm exercise theo ID kèm câu hỏi
        @Query("SELECT DISTINCT e FROM Exercise e " +
                        "LEFT JOIN FETCH e.questions q " +
                        "WHERE e.id = :id " +
                        "ORDER BY q.displayOrder ASC")
        Optional<Exercise> findByIdWithQuestions(@Param("id") Long id);

        // Lấy bài tập kèm câu hỏi và options bằng @Query
        @Query("SELECT e FROM Exercise e " +
                        "JOIN e.category c " +
                        "JOIN e.level l " +
                        "WHERE c.name = :categoryName AND l.level = :levelType")
        List<Exercise> findByCategoryAndLevel(
                        @Param("categoryName") String categoryName,
                        @Param("levelType") JlptLevelType levelType);
}
