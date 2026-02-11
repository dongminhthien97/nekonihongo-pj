package com.nekonihongo.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nekonihongo.backend.dto.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
        private final ObjectMapper objectMapper;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(Customizer.withDefaults())

                                // Xử lý lỗi 401 và 403
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((req, res, authException) -> {
                                                        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        res.setContentType("application/json;charset=UTF-8");
                                                        res.getWriter().write(objectMapper.writeValueAsString(
                                                                        ApiResponse.error("Unauthorized",
                                                                                        "UNAUTHORIZED")));
                                                })
                                                .accessDeniedHandler((req, res, accessDeniedException) -> {
                                                        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                                        res.setContentType("application/json;charset=UTF-8");
                                                        res.getWriter().write(objectMapper.writeValueAsString(
                                                                        ApiResponse.error("Forbidden", "FORBIDDEN")));
                                                }))

                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/health",
                                                                "/api/health",
                                                                "/api/ping")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                // Swagger và tài liệu API
                                                .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                                                                "/v3/api-docs/**", "/swagger-resources/**",
                                                                "/webjars/**")
                                                .permitAll()

                                                // Các API công khai
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/grammar/lessons").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/grammar/**").permitAll()
                                                .requestMatchers("/api/vocabulary/**").permitAll()
                                                .requestMatchers("/api/vocabulary/n5/**").permitAll()
                                                .requestMatchers("/api/kanji/n5/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/kanji/lessons").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/exercises/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/exercises/submit").permitAll()
                                                .requestMatchers("/api/hiragana/**").permitAll()
                                                .requestMatchers("/api/katakana/**").permitAll()
                                                .requestMatchers("/api/admin/mini-test/**").permitAll()
                                                .requestMatchers("/api/user/mini-test/**").permitAll()
                                                .requestMatchers("/api/grammar-tests/**").permitAll()
                                                .requestMatchers("/api/grammar/mini-test/**").permitAll()
                                                .requestMatchers("/api/admin/questions/**").permitAll()
                                                .requestMatchers(
                                                                "/api/admin/questions/lesson/{lessonId}/correct-answers")
                                                .permitAll()
                                                .requestMatchers("/api/grammar/jlpt/**").permitAll()
                                                .requestMatchers("/api/kanji/jlpt/{level}/**").permitAll()
                                                .requestMatchers("/api/kanji/jlpt/{level}/count").permitAll()

                                                // Các API cần đăng nhập
                                                .requestMatchers("/api/user/progress/vocabulary").authenticated()
                                                .requestMatchers("/api/user/me/**").authenticated()
                                                .requestMatchers("/api/user/**").authenticated()

                                                // Admin APIs
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // Tất cả còn lại cần đăng nhập
                                                .anyRequest().authenticated())

                                // Stateless session
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Thêm JWT filter
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // CORS configuration bean
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration config = new CorsConfiguration();

                config.setAllowCredentials(false); // QUAN TRỌNG

                config.setAllowedOriginPatterns(List.of(
                                "https://*.vercel.app",
                                "http://localhost:5173",
                                "http://localhost:3000"));

                config.setAllowedMethods(List.of("*"));
                config.setAllowedHeaders(List.of("*"));
                config.setExposedHeaders(List.of("Authorization"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);

                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                // Production: dùng BCrypt (mạnh)
                return new BCryptPasswordEncoder();
                // Dev/test: NoOpPasswordEncoder.getInstance() nếu cần
        }
}