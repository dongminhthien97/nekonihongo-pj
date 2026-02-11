package com.nekonihongo.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.nekonihongo.backend.entity.KanjiLesson;

public interface KanjiLessonRepository extends JpaRepository<KanjiLesson, Integer> {
        @Query("""
                        SELECT DISTINCT l
                        FROM KanjiLesson l
                        LEFT JOIN FETCH l.kanjiList k
                        ORDER BY l.displayOrder, k.displayOrder
                        """)
        List<KanjiLesson> findAllWithKanjiOnly();

        @EntityGraph(attributePaths = { "kanjiList", "kanjiList.compounds" })
        Optional<KanjiLesson> findById(Integer id);

        @Query("""
                        SELECT DISTINCT l
                        FROM KanjiLesson l
                        LEFT JOIN FETCH l.kanjiList k
                        LEFT JOIN FETCH k.compounds
                        ORDER BY l.displayOrder, k.displayOrder
                        """)
        List<KanjiLesson> findAllWithKanjiAndCompounds();

        @Query("SELECT COUNT(l) FROM KanjiLesson l")
        long countLessons();

        @Query("SELECT COUNT(k) FROM Kanji k")
        long countKanji();

        @Query("SELECT COUNT(c) FROM KanjiCompound c")
        long countCompounds();
}
