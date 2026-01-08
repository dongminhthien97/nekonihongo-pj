package com.nekonihongo.backend.service;

import com.nekonihongo.backend.entity.User;
import com.nekonihongo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.DisabledException;
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
        // Support login by either email or username (case-insensitive)
        User user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> {
                    log.error("❌ User not found by username/email: {}", identifier);
                    return new UsernameNotFoundException("User not found: " + identifier);
                });
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new DisabledException("Tài khoản của bạn đã bị khóa hoặc cấm");
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false) // Vì đã check status ở trên
                .build();
    }

    /**
     * Utility method for controllers/services to fetch user by username or email.
     */
    public User findUserByUsernameOrEmail(String identifier) {
        return userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(identifier, identifier)
                .orElseThrow(() -> {
                    log.error("❌ User not found by username/email: {}", identifier);
                    throw new UsernameNotFoundException("User not found: " + identifier);
                });
    }
}
