// src/main/java/com/nekonihongo/backend/service/JwtService.java
package com.nekonihongo.backend.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private static final long CLOCK_SKEW_TOLERANCE_MS = 30000; // ±30 seconds

    // Ensure JWT secret is mandatory and fail fast if missing
    public void validateJwtSecret() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("JWT_SECRET environment variable is required and cannot be empty");
        }
        // Log expiration settings for debugging
        System.out.println("JWT Service initialized:");
        System.out.println("  - Access token expiration: " + expirationMs + " ms");
        System.out.println("  - Refresh token expiration: " + refreshExpirationMs + " ms");
        System.out.println("  - Clock skew tolerance: ±" + CLOCK_SKEW_TOLERANCE_MS + " ms");
    }

    // Tạo key từ secret (chuẩn JJWT 0.12+)
    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            // Not a valid Base64 string - fall back to raw bytes of the secret
            byte[] keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            return Keys.hmacShaKeyFor(keyBytes);
        }
    }

    // Tạo token
    public String generateToken(String email, Map<String, Object> claims) {
        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // LẤY EMAIL TỪ TOKEN – DÙNG CÚ PHÁP MỚI!
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // KIỂM TRA TOKEN HỢP LỆ
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("JWT token is expired: " + e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            System.out.println("JWT token is unsupported: " + e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            System.out.println("JWT token is malformed: " + e.getMessage());
            return false;
        } catch (SignatureException e) {
            System.out.println("JWT signature is invalid: " + e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            System.out.println("JWT token is empty: " + e.getMessage());
            return false;
        }
    }
}
