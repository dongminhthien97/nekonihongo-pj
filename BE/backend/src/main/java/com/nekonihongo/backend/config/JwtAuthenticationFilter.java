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
import org.springframework.core.annotation.Order;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Order(1) // ensure this filter runs early
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    // paths that should be excluded from JWT checks
    private static final String[] WHITELIST = new String[] {
            "/api/auth",
            "/swagger-ui",
            "/v3/api-docs",
            "/swagger-resources",
            "/webjars",
            "/error",
            "/favicon.ico"
    };

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        return java.util.Arrays.stream(WHITELIST).anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");

        if (log.isDebugEnabled()) {
            log.debug("JwtAuthFilter - requestURI={}", path);
            log.debug("JwtAuthFilter - Authorization header present: {}", authHeader != null);
        }

        // No header or not a Bearer token -> skip (security will handle access)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (log.isDebugEnabled())
                log.debug("JwtAuthFilter - no Bearer token, skipping filter");
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String email = null;
        try {
            email = jwtService.extractEmail(jwt);
        } catch (Exception e) {
            if (log.isDebugEnabled())
                log.debug("JwtAuthFilter - failed to extract email from token: {}", e.getMessage());
        }

        if (log.isDebugEnabled()) {
            log.debug("JwtAuthFilter - extracted email={}", email);
            log.debug("JwtAuthFilter - token valid={}", jwtService.isTokenValid(jwt));
        }

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
                    if (log.isDebugEnabled())
                        log.debug("JwtAuthFilter - authentication set for user={}", userDetails.getUsername());
                }
            } catch (Exception e) {
                // token invalid or user load failed -> clear context
                SecurityContextHolder.clearContext();
                if (log.isDebugEnabled())
                    log.debug("JwtAuthFilter - authentication failed: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}