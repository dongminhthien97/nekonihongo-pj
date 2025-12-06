// src/main/java/com/nekonihongo/backend/service/impl/UserService.java
package com.nekonihongo.backend.service.impl;

import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.UserRepository;
import com.nekonihongo.backend.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements IUserService {

    private final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User createUser(User user, String rawPassword) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setJoinDate(LocalDate.now());

        // SAI: Không được so sánh int với null
        // if (user.getRole() == null) user.setRole(User.Role.USER);

        // ĐÚNG: Dùng giá trị mặc định hoặc kiểm tra bằng cách khác
        if (user.getRole() == null) {
            user.setRole(User.Role.USER);
        }

        // Các field nguyên thủy (int) KHÔNG CẦN kiểm tra null → luôn có giá trị
        // Nếu chưa set → tự động là 0 → nhưng ta gán rõ ràng cho chắc
        user.setLevel(user.getLevel() > 0 ? user.getLevel() : 1);
        user.setPoints(user.getPoints() >= 0 ? user.getPoints() : 0);
        user.setVocabularyProgress(user.getVocabularyProgress() >= 0 ? user.getVocabularyProgress() : 0);
        user.setKanjiProgress(user.getKanjiProgress() >= 0 ? user.getKanjiProgress() : 0);
        user.setGrammarProgress(user.getGrammarProgress() >= 0 ? user.getGrammarProgress() : 0);
        user.setExerciseProgress(user.getExerciseProgress() >= 0 ? user.getExerciseProgress() : 0);
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        User existing = findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));

        existing.setUsername(updatedUser.getUsername());
        existing.setFullName(updatedUser.getFullName());
        existing.setAvatarUrl(updatedUser.getAvatarUrl());
        existing.setRole(updatedUser.getRole());
        existing.setLevel(updatedUser.getLevel());
        existing.setPoints(updatedUser.getPoints());
        existing.setVocabularyProgress(updatedUser.getVocabularyProgress());
        existing.setKanjiProgress(updatedUser.getKanjiProgress());
        existing.setGrammarProgress(updatedUser.getGrammarProgress());
        existing.setExerciseProgress(updatedUser.getExerciseProgress());

        return userRepository.save(existing);
    }

    @Override
    public void deleteById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User không tồn tại!");
        }
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public long countByRole(User.Role role) {
        return userRepository.countByRole(role);
    }
}