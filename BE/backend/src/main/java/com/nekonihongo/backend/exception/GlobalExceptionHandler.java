package com.nekonihongo.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.OffsetDateTime;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<?> handleMethodArgumentTypeMismatch(
                        MethodArgumentTypeMismatchException ex,
                        HttpServletRequest request) {

                log.warn(
                                "BAD REQUEST - Type mismatch | path={} | param={} | value={}",
                                request.getRequestURI(),
                                ex.getName(),
                                ex.getValue());

                return ResponseEntity.badRequest().body(errorBody(
                                HttpStatus.BAD_REQUEST,
                                "Invalid parameter: " + ex.getName(),
                                request.getRequestURI()));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<?> handleIllegalArgumentException(
                        IllegalArgumentException ex,
                        HttpServletRequest request) {

                log.warn(
                                "BAD REQUEST - Illegal argument | path={} | message={}",
                                request.getRequestURI(),
                                ex.getMessage());

                return ResponseEntity.badRequest().body(errorBody(
                                HttpStatus.BAD_REQUEST,
                                ex.getMessage(),
                                request.getRequestURI()));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<?> handleMethodArgumentNotValid(
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

                return ResponseEntity.badRequest().body(errorBody(
                                HttpStatus.BAD_REQUEST,
                                message,
                                request.getRequestURI()));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<?> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {

                // 🔥 QUAN TRỌNG: log full stacktrace
                log.error(
                                "INTERNAL SERVER ERROR | path={} | method={}",
                                request.getRequestURI(),
                                request.getMethod(),
                                ex);

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Unexpected error",
                                request.getRequestURI()));
        }

        private Map<String, Object> errorBody(HttpStatus status, String message, String path) {
                return Map.of(
                                "status", status.value(),
                                "error", status.getReasonPhrase(),
                                "message", message,
                                "path", path,
                                "timestamp", OffsetDateTime.now().toString());
        }
}
