package com.nekonihongo.backend.repository;

import com.nekonihongo.backend.entity.GrammarQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarQuestionRepository extends JpaRepository<GrammarQuestion, Long> {

    List<GrammarQuestion> findByLessonId(Integer lessonId);

    boolean existsByLessonId(Integer lessonId);
}