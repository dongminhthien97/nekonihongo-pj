package com.nekonihongo.backend.service;

import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreakService {

    private final UserRepository userRepository;

    /**
     * Cập nhật streak khi user đăng nhập.
     * - Lần đầu đăng nhập: streak = 1
     * - Đăng nhập liên tiếp: streak +1
     * - Bỏ lỡ >= 2 ngày: streak reset = 1
     * - Đã đăng nhập hôm nay: giữ nguyên
     */
    @Transactional
    public void updateLoginStreak(User user) {
        LocalDate today = LocalDate.now();

        if (user.getLastLoginDate() == null) {
            // Lần đầu đăng nhập
            user.setStreak(1);
            user.setLongestStreak(1);
            log.info("👤 User {} lần đầu đăng nhập → streak = 1", user.getId());
        } else {
            LocalDate lastLoginDate = user.getLastLoginDate().toLocalDate();

            if (lastLoginDate.equals(today)) {
                // Đã đăng nhập hôm nay, không làm gì
                log.info("👤 User {} đã đăng nhập hôm nay → streak giữ nguyên = {}",
                        user.getId(), user.getStreak());
                return;
            } else if (lastLoginDate.equals(today.minusDays(1))) {
                // Đăng nhập liên tiếp → tăng streak
                user.setStreak(user.getStreak() + 1);
                log.info("🔥 User {} đăng nhập liên tiếp → streak +1 = {}",
                        user.getId(), user.getStreak());

                if (user.getStreak() > user.getLongestStreak()) {
                    user.setLongestStreak(user.getStreak());
                    log.info("🏆 User {} đạt kỷ lục mới → longestStreak = {}",
                            user.getId(), user.getLongestStreak());
                }
            } else {
                // Break streak → reset về 1
                user.setStreak(1);
                log.info("⚠️ User {} bỏ lỡ nhiều ngày → streak reset = 1", user.getId());
            }
        }

        user.setLastLoginDate(LocalDateTime.now());
        userRepository.save(user);

        log.info("✅ Updated login streak cho user {}: streak={}, longest={}",
                user.getId(), user.getStreak(), user.getLongestStreak());
    }

    /**
     * Kiểm tra streak còn hoạt động (đăng nhập hôm nay hoặc hôm qua).
     */
    public boolean isStreakActive(User user) {
        if (user.getLastLoginDate() == null) {
            return false;
        }

        LocalDate lastLogin = user.getLastLoginDate().toLocalDate();
        LocalDate today = LocalDate.now();

        return lastLogin.equals(today) || lastLogin.equals(today.minusDays(1));
    }

    /**
     * Tính số ngày bỏ lỡ kể từ lần đăng nhập cuối.
     */
    public int getMissedDays(User user) {
        if (user.getLastLoginDate() == null) {
            return 0;
        }

        LocalDate lastLogin = user.getLastLoginDate().toLocalDate();
        LocalDate today = LocalDate.now();

        if (lastLogin.equals(today)) {
            return 0;
        }

        return (int) ChronoUnit.DAYS.between(lastLogin, today) - 1;
    }

    /**
     * Reset streak về 0.
     */
    @Transactional
    public void resetStreak(User user) {
        user.setStreak(0);
        user.setLastLoginDate(null);
        userRepository.save(user);

        log.info("Reset streak for user {}", user.getId());
    }
}
