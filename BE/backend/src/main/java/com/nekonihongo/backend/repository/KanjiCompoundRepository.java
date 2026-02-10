package com.nekonihongo.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nekonihongo.backend.entity.KanjiCompound;

@Repository
public interface KanjiCompoundRepository extends JpaRepository<KanjiCompound, Long> {

    @Query("SELECT c FROM KanjiCompound c WHERE c.kanji.id = :kanjiId ORDER BY c.displayOrder")
    List<KanjiCompound> findByKanjiIdOrderByDisplayOrder(Long kanjiId);
}