package com.nekonihongo.backend.exception;

import com.nekonihongo.backend.dto.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.connector.ClientAbortException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.io.EOFException;
import java.io.IOException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
                String message = ex.getBindingResult().getFieldErrors().stream()
                                .findFirst()
                                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                                .orElse("Validation failed");
                return ResponseEntity.badRequest().body(ApiResponse.error(message, "VALIDATION_ERROR"));
        }

        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException ex) {
                String message = ex.getConstraintViolations().stream()
                                .findFirst()
                                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                                .orElse("Validation failed");
                return ResponseEntity.badRequest().body(ApiResponse.error(message, "VALIDATION_ERROR"));
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiResponse<Void>> handleMethodArgumentTypeMismatch(
                        MethodArgumentTypeMismatchException ex) {
                String required = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "required type";
                String message = "Invalid parameter: " + ex.getName() + " must be " + required;
                return ResponseEntity.badRequest().body(ApiResponse.error(message, "BAD_REQUEST"));
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Malformed JSON request", "BAD_REQUEST"));
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error("Email or password incorrect", "AUTH_INVALID_CREDENTIALS"));
        }

        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error("Unauthorized", "UNAUTHORIZED"));
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error("Forbidden", "FORBIDDEN"));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
                String message = ex.getMessage();
                if (message == null || message.isBlank()) {
                        message = "Invalid request";
                }
                return ResponseEntity.badRequest().body(ApiResponse.error(message, "BAD_REQUEST"));
        }

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<ApiResponse<Void>> handleResponseStatus(ResponseStatusException ex) {
                String message = ex.getReason() != null ? ex.getReason() : ex.getStatusCode().toString();
                String errorCode = "HTTP_" + ex.getStatusCode().value();
                return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(message, errorCode));
        }

        @ExceptionHandler(ErrorResponseException.class)
        public ResponseEntity<ApiResponse<Void>> handleErrorResponseException(ErrorResponseException ex) {
                String message = ex.getBody() != null && ex.getBody().getDetail() != null
                                ? ex.getBody().getDetail()
                                : "Request failed";
                String errorCode = "HTTP_" + ex.getStatusCode().value();
                return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.error(message, errorCode));
        }

        @ExceptionHandler({ ClientAbortException.class, EOFException.class, AsyncRequestNotUsableException.class })
        public ResponseEntity<Void> handleClientAbort(Exception ex) {
                log.debug("Client aborted connection: {}", ex.getMessage());
                return ResponseEntity.noContent().build();
        }

        @ExceptionHandler(IOException.class)
        public ResponseEntity<?> handleIOException(IOException ex) {
                String msg = ex.getMessage();
                if (msg != null && (msg.contains("Broken pipe") || msg.contains("Connection reset by peer"))) {
                        log.debug("Client IO aborted: {}", msg);
                        return ResponseEntity.noContent().build();
                }
                log.warn("I/O error", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error("I/O error", "IO_ERROR"));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleUnhandled(Exception ex) {
                log.error("Unhandled exception", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error("Internal server error", "INTERNAL_ERROR"));
        }
}