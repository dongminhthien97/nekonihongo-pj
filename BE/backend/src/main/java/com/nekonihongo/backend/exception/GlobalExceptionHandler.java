package com.nekonihongo.backend.exception;

import com.nekonihongo.backend.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.servlet.ServletException;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<?>> handleResourceNotFound(
                        ResourceNotFoundException ex,
                        HttpServletRequest request) {

                log.warn("RESOURCE NOT FOUND | path={} | message={}",
                                request.getRequestURI(),
                                ex.getMessage());

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.notFound(ex.getMessage()));
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<ApiResponse<?>> handleMissingParams(
                        MissingServletRequestParameterException ex,
                        HttpServletRequest request) {

                log.warn("BAD REQUEST - Missing parameter | path={} | param={}",
                                request.getRequestURI(),
                                ex.getParameterName());

                return ResponseEntity.badRequest()
                                .body(ApiResponse.validationError(
                                                "Required parameter is missing: " + ex.getParameterName()));
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiResponse<?>> handleMalformedJson(
                        HttpMessageNotReadableException ex,
                        HttpServletRequest request) {

                log.warn("BAD REQUEST - Malformed JSON | path={} | message={}",
                                request.getRequestURI(),
                                ex.getMessage());

                return ResponseEntity.badRequest()
                                .body(ApiResponse.validationError("Malformed JSON request body"));
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiResponse<?>> handleMethodArgumentTypeMismatch(
                        MethodArgumentTypeMismatchException ex,
                        HttpServletRequest request) {

                log.warn(
                                "BAD REQUEST - Type mismatch | path={} | param={} | value={}",
                                request.getRequestURI(),
                                ex.getName(),
                                ex.getValue());

                return ResponseEntity.badRequest()
                                .body(ApiResponse.validationError("Invalid parameter type: " + ex.getName()));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(
                        IllegalArgumentException ex,
                        HttpServletRequest request) {

                log.warn(
                                "BAD REQUEST - Illegal argument | path={} | message={}",
                                request.getRequestURI(),
                                ex.getMessage());

                return ResponseEntity.badRequest()
                                .body(ApiResponse.validationError(ex.getMessage()));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValid(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {

                String message = ex.getBindingResult().getFieldErrors().stream()
                                .findFirst()
                                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                                .orElse("Validation failed");

                log.warn(
                                "BAD REQUEST - Validation failed | path={} | error={}",
                                request.getRequestURI(),
                                message);

                return ResponseEntity.badRequest()
                                .body(ApiResponse.validationError(message));
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiResponse<?>> handleBadCredentials(
                        BadCredentialsException ex,
                        HttpServletRequest request) {

                log.warn(
                                "AUTH FAILED | path={} | method={} | message={}",
                                request.getRequestURI(),
                                request.getMethod(),
                                ex.getMessage());

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.unauthorized("Sai tài khoản hoặc mật khẩu"));
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<?>> handleAccessDenied(
                        AccessDeniedException ex,
                        HttpServletRequest request) {

                log.warn(
                                "ACCESS DENIED | path={} | method={} | message={}",
                                request.getRequestURI(),
                                request.getMethod(),
                                ex.getMessage());

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.forbidden("Bạn không có quyền truy cập"));
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ApiResponse<?>> handleRuntimeException(
                        RuntimeException ex,
                        HttpServletRequest request) {

                log.error(
                                "RUNTIME EXCEPTION | path={} | method={} | message={}",
                                request.getRequestURI(),
                                request.getMethod(),
                                ex.getMessage());

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.serverError("Lỗi hệ thống không mong muốn"));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<?>> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {

                // Disable stacktrace logging for ClientAbortException (broken pipe)
                if (ex instanceof IOException && ex.getMessage() != null &&
                                (ex.getMessage().contains("Broken pipe")
                                                || ex.getMessage().contains("Connection reset"))) {
                        log.warn("CLIENT DISCONNECTED (Broken pipe) | path={} | message={}",
                                        request.getRequestURI(),
                                        ex.getMessage());
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.serverError("Client disconnected"));
                }

                log.error(
                                "INTERNAL SERVER ERROR | path={} | method={} | rootCause={}",
                                request.getRequestURI(),
                                request.getMethod(),
                                ex.getMessage(),
                                ex);

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.serverError("Lỗi hệ thống không mong muốn"));
        }
}
