package com.nekonihongo.backend.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;

        // ENV: app.cors.allowed-origins=https://xxx,https://yyy
        @Value("${app.cors.allowed-origins:}")
        private String allowedOriginsProperty;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                // REST API → disable CSRF
                                .csrf(csrf -> csrf.disable())

                                // Enable CORS
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // Exception handling
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((req, res, authException) -> {
                                                        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        res.setContentType("application/json");
                                                        res.getWriter().write(
                                                                        "{\"error\":\"Unauthorized\",\"message\":\"Token không hợp lệ hoặc hết hạn\"}");
                                                })
                                                .accessDeniedHandler((req, res, accessDeniedException) -> {
                                                        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                                        res.setContentType("application/json");
                                                        res.getWriter().write(
                                                                        "{\"error\":\"Forbidden\",\"message\":\"Bạn không có quyền truy cập\"}");
                                                }))

                                // Authorization
                                .authorizeHttpRequests(auth -> auth
                                                // ⭐ BẮT BUỘC: cho phép CORS preflight
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // Public endpoints
                                                .requestMatchers(
                                                                "/auth/**",
                                                                "/api/auth/**",

                                                                "/api/*/preview",
                                                                "/api/*/preview/**",

                                                                "/api/*/public",
                                                                "/api/*/public/**",

                                                                "/health",
                                                                "/actuator/health",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**")
                                                .permitAll()

                                                // Admin
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // Others
                                                .anyRequest().authenticated())

                                // Stateless session
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // JWT filter
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                List<String> origins = Arrays.stream(allowedOriginsProperty.split(","))
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .collect(Collectors.toList());

                // fallback nếu ENV chưa set
                if (origins.isEmpty()) {
                        origins = List.of(
                                        "https://nekonihongos.vercel.app",
                                        "https://nekonihongo-nwlqjjt7a-dongminhthien97s-projects.vercel.app");
                }

                // Có wildcard hay không
                if (origins.stream().anyMatch(o -> o.contains("*"))) {
                        config.setAllowedOriginPatterns(origins);
                } else {
                        config.setAllowedOrigins(origins);
                }

                config.setAllowedMethods(List.of(
                                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(false);
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
