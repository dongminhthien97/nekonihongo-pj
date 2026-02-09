package com.nekonihongo.backend.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
                                .csrf(csrf -> csrf.disable())
                                .cors(Customizer.withDefaults()) // 🔥 QUAN TRỌNG

                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((req, res, e) -> {
                                                        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        res.setContentType("application/json");
                                                        res.getWriter().write(
                                                                        """
                                                                                            {"error":"Unauthorized","message":"Token không hợp lệ hoặc hết hạn"}
                                                                                        """);
                                                })
                                                .accessDeniedHandler((req, res, e) -> {
                                                        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                                        res.setContentType("application/json");
                                                        res.getWriter().write(
                                                                        """
                                                                                            {"error":"Forbidden","message":"Bạn không có quyền truy cập"}
                                                                                        """);
                                                }))

                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/health",
                                                                "/actuator/health",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**")
                                                .permitAll()
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                .anyRequest().authenticated())

                                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                config.setAllowedOriginPatterns(List.of(
                                "https://*.vercel.app",
                                "https://nekonihongos.vercel.app"));

                config.setAllowedMethods(List.of(
                                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

                config.setAllowedHeaders(List.of(
                                "Authorization",
                                "Content-Type",
                                "Accept",
                                "Origin",
                                "X-Requested-With"));

                config.setAllowCredentials(true); // 🔥 BẮT BUỘC
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
