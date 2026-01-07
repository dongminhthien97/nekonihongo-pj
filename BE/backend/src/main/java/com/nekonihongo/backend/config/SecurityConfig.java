// src/main/java/com/nekonihongo/backend/config/SecurityConfig.java
package com.nekonihongo.backend.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // Xử lý lỗi 401 và 403
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((req, res, authException) -> {
                                                        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        res.setContentType("application/json");
                                                        res.getWriter().write(
                                                                        "{\"error\": \"Unauthorized\", \"message\": \"Token không hợp lệ hoặc hết hạn\"}");
                                                })
                                                .accessDeniedHandler((req, res, accessDeniedException) -> {
                                                        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                                        res.setContentType("application/json");
                                                        res.getWriter().write(
                                                                        "{\"error\": \"Forbidden\", \"message\": \"Bạn không có quyền truy cập\"}");
                                                }))

                                .authorizeHttpRequests(auth -> auth
                                                // Swagger và tài liệu API
                                                .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                                                "/v3/api-docs/**", "/swagger-resources/**",
                                                                "/webjars/**")
                                                .permitAll()

                                                // Các API công khai
                                                .requestMatchers(HttpMethod.GET, "/api/grammar/lessons").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/grammar/n5/**").permitAll()
                                                .requestMatchers("/api/vocabulary/**").permitAll()
                                                .requestMatchers("/api/vocabulary/n5/**").permitAll()
                                                .requestMatchers("/api/kanji/n5/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/kanji/lessons").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/exercises/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/exercises/submit").permitAll()
                                                // Các API cần đăng nhập
                                                .requestMatchers("/api/user/progress/vocabulary").authenticated()
                                                .requestMatchers("/api/user/me/**").authenticated()

                                                // User APIs
                                                .requestMatchers("/api/user/**").authenticated()

                                                // Admin APIs (TRỪ activity-logs)
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // Tất cả còn lại cần đăng nhập
                                                .anyRequest().authenticated())

                                // Stateless session
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowCredentials(true);
                // Cho phép cả Vite (5173) và React (3000)
                config.setAllowedOrigins(List.of(
                                "http://localhost:5173",
                                "http://localhost:3000",
                                "http://127.0.0.1:5173"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                // ⚠️ Chỉ dùng NoOpPasswordEncoder cho dev/test
                // Trong production nên dùng BCryptPasswordEncoder
                return NoOpPasswordEncoder.getInstance();
        }
}
