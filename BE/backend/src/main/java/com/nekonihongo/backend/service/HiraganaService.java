package com.nekonihongo.backend.service;

import com.nekonihongo.backend.dto.HiraganaDTO;
import com.nekonihongo.backend.dto.request.HiraganaRequest;
import com.nekonihongo.backend.entity.Hiragana;
import com.nekonihongo.backend.mapper.HiraganaMapper;
import com.nekonihongo.backend.repository.HiraganaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HiraganaService {
    private final HiraganaRepository hiraganaRepository;
    private final HiraganaMapper hiraganaMapper;

    public List<HiraganaDTO> getAllHiragana() {
        return hiraganaRepository.findAll()
                .stream()
                .map(hiraganaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public HiraganaDTO getByCharacter(String character) {
        Hiragana hiragana = hiraganaRepository.findByCharacter(character)
                .orElse(null);
        return hiraganaMapper.toDTO(hiragana);
    }

    public HiraganaDTO createHiragana(HiraganaRequest request) {
        if (hiraganaRepository.findByCharacter(request.getCharacter()).isPresent()) {
            throw new IllegalArgumentException("Character already exists");
        }

        Hiragana hiragana = hiraganaMapper.toEntity(request);
        Hiragana saved = hiraganaRepository.save(hiragana);
        return hiraganaMapper.toDTO(saved);
    }

    public HiraganaDTO updateHiragana(Integer id, HiraganaRequest request) {
        Hiragana existing = hiraganaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hiragana not found"));

        if (!existing.getCharacter().equals(request.getCharacter())
                && hiraganaRepository.findByCharacter(request.getCharacter()).isPresent()) {
            throw new IllegalArgumentException("Character already exists");
        }

        existing.setCharacter(request.getCharacter());
        existing.setRomanji(request.getRomanji());
        existing.setUnicode(request.getUnicode());
        existing.setStrokeOrder(request.getStrokeOrder());

        Hiragana updated = hiraganaRepository.save(existing);
        return hiraganaMapper.toDTO(updated);
    }

    public void deleteHiragana(Integer id) {
        if (!hiraganaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Hiragana not found");
        }
        hiraganaRepository.deleteById(id);
    }
}