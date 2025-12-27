// KanjiN5Repository.java
package com.nekonihongo.backend.repository;

import com.nekonihongo.backend.entity.KanjiN5;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KanjiN5Repository extends JpaRepository<KanjiN5, Long> {
    List<KanjiN5> findAllByOrderByIdAsc();
}