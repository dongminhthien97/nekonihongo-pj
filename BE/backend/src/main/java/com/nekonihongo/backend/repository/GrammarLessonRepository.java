// GrammarLessonRepository.java
package com.nekonihongo.backend.repository;

import com.nekonihongo.backend.entity.GrammarLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface GrammarLessonRepository extends JpaRepository<GrammarLesson, Integer> {
    @Query("SELECT l FROM GrammarLesson l LEFT JOIN FETCH l.points p LEFT JOIN FETCH p.examples ORDER BY l.id")
    List<GrammarLesson> findAllWithPointsAndExamples();
}