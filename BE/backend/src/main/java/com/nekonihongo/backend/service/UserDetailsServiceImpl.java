package com.nekonihongo.backend.service;

import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        log.info("🔍 loadUserByUsername called with: {}", identifier);

        // Support login by either email or username (case-insensitive)
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> {
                    log.error("❌ User not found by username/email: {}", identifier);
                    return new UsernameNotFoundException("User not found: " + identifier);
                });

        log.info("✅ User found: ID={}, Username={}, Email={}, Role={}",
                user.getId(), user.getUsername(), user.getEmail(), user.getRole());

        // Use username as principal (unique in DB)
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    /**
     * Utility method for controllers/services to fetch user by username or email.
     */
    public User findUserByUsernameOrEmail(String identifier) {
        log.info("🔍 Finding user by username or email: {}", identifier);

        return userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> {
                    log.error("❌ User not found by username/email: {}", identifier);
                    throw new UsernameNotFoundException("User not found: " + identifier);
                });
    }
}
