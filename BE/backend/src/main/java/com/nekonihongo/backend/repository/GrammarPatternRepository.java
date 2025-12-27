// GrammarPatternRepository.java
package com.nekonihongo.backend.repository;

import com.nekonihongo.backend.entity.GrammarPattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarPatternRepository extends JpaRepository<GrammarPattern, Long> {
    // Chỉ lấy N5 – hoặc lấy tất cả nếu frontend filter
    List<GrammarPattern> findAllByOrderByIdAsc();
}