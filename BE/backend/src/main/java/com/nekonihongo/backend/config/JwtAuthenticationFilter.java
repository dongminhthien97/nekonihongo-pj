// src/main/java/com/nekonihongo/backend/config/JwtAuthenticationFilter.java
package com.nekonihongo.backend.config;

import com.nekonihongo.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    // Danh sách các path KHÔNG CẦN kiểm tra JWT (permitAll)
    private static final String[] WHITELIST = {
            "/api/auth/",
            "/api/grammar/",
            "/api/vocabulary/",
            "/swagger-ui/",
            "/v3/api-docs",
            "/swagger-resources",
            "/webjars",
            "/error",
            "/favicon.ico"
    };

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        if (log.isDebugEnabled()) {
            log.debug("JwtAuthFilter - Checking shouldNotFilter for path: {}", path);
        }

        boolean shouldSkip = path.startsWith("/api/auth/") ||
                path.startsWith("/api/grammar/") ||
                path.startsWith("/api/vocabulary/") ||
                path.startsWith("/swagger-ui/") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-resources") ||
                path.startsWith("/webjars/") ||
                path.equals("/error") ||
                path.equals("/favicon.ico");

        if (log.isDebugEnabled()) {
            log.debug("JwtAuthFilter - shouldNotFilter = {}", shouldSkip);
        }

        return shouldSkip;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String path = request.getRequestURI();
        final String authHeader = request.getHeader("Authorization");

        if (log.isDebugEnabled()) {
            log.debug("JwtAuthFilter - Processing request: {}", path);
            log.debug("JwtAuthFilter - Authorization header present: {}", authHeader != null);
        }

        // Nếu không có header Bearer → bỏ qua validate (SecurityConfig sẽ quyết định
        // permit hay không)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (log.isDebugEnabled()) {
                log.debug("JwtAuthFilter - No Bearer token found, skipping authentication");
            }
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        String email = null;

        try {
            email = jwtService.extractEmail(jwt);
        } catch (Exception e) {
            if (log.isDebugEnabled()) {
                log.debug("JwtAuthFilter - Invalid token format: {}", e.getMessage());
            }
        }

        if (log.isDebugEnabled()) {
            log.debug("JwtAuthFilter - Extracted email: {}", email);
        }

        // Chỉ authenticate nếu chưa có authentication và token hợp lệ
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtService.isTokenValid(jwt)) {
                    var authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    if (log.isDebugEnabled()) {
                        log.debug("JwtAuthFilter - Authentication set for user: {}", email);
                    }
                } else {
                    if (log.isDebugEnabled()) {
                        log.debug("JwtAuthFilter - Token expired or invalid for user: {}", email);
                    }
                }
            } catch (Exception e) {
                if (log.isDebugEnabled()) {
                    log.debug("JwtAuthFilter - Failed to load user or validate token: {}", e.getMessage());
                }
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}