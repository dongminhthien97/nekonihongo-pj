// src/main/java/com/neko/repository/N5VocabularyRepository.java
package com.nekonihongo.backend.repository;

import com.nekonihongo.backend.entity.N5Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface N5VocabularyRepository extends JpaRepository<N5Vocabulary, Long> {

    // Tìm kiếm theo tuVung, hanTu, tiengViet
    @Query("SELECT n FROM N5Vocabulary n WHERE " +
            "LOWER(n.tuVung) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.hanTu) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.tiengViet) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<N5Vocabulary> searchByQuery(String query, Pageable pageable);

    // Lấy tất cả phân trang
    Page<N5Vocabulary> findAll(Pageable pageable);
}