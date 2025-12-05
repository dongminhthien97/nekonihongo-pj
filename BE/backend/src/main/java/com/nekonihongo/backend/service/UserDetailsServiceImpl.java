// src/main/java/com/nekonihongo/backend/service/UserDetailsServiceImpl.java
package com.nekonihongo.backend.service;

import com.nekonihongo.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor; // THÊM DÒNG NÀY!
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // THÊM ANNOTATION NÀY!
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository; // final + Lombok → tự tạo constructor

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(user -> User
                        .withUsername(user.getEmail())
                        .password(user.getPassword())
                        .roles(user.getRole().name())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}