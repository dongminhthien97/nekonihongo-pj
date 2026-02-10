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
                                // Disable CSRF for stateless JWT authentication
                                .csrf(csrf -> csrf.disable())

                                // Disable form login and HTTP basic authentication
                                .formLogin(form -> form.disable())
                                .httpBasic(basic -> basic.disable())

                                // Enable CORS
                                .cors(Customizer.withDefaults())

                                // Configure exception handling
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

                                // Configure authorization rules
                                .authorizeHttpRequests(auth -> auth
                                                // Always allow OPTIONS (preflight) requests
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // Public endpoints
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/health",
                                                                "/actuator/health",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**")
                                                .permitAll()

                                                // Admin endpoints require ADMIN role
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // All other API endpoints require authentication
                                                .requestMatchers("/api/**").authenticated()

                                                // Everything else is denied by default
                                                .anyRequest().denyAll())

                                // Use stateless session management
                                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Add JWT filter before UsernamePasswordAuthenticationFilter
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                // Always allow OPTIONS (preflight) requests
                config.setAllowedMethods(List.of(
                                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

                config.setAllowedHeaders(List.of(
                                "Authorization",
                                "Content-Type",
                                "Accept",
                                "Origin",
                                "X-Requested-With"));

                // Handle allowed origins from environment
                if (allowedOriginsProperty != null && !allowedOriginsProperty.trim().isEmpty()) {
                        String[] origins = allowedOriginsProperty.split(",");
                        config.setAllowedOriginPatterns(List.of(origins));
                        System.out.println("CORS allowed origins: " + allowedOriginsProperty);
                } else {
                        // If no origins specified, allow all but don't set credentials
                        config.setAllowedOriginPatterns(List.of("*"));
                        System.out.println("CORS: All origins allowed (no credentials)");
                }

                // Only allow credentials if specific origins are configured
                config.setAllowCredentials(allowedOriginsProperty != null && !allowedOriginsProperty.trim().isEmpty());
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
