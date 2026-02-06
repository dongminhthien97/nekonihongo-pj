package com.nekonihongo.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<?> handleResourceNotFound(
                        ResourceNotFoundException ex,
                        HttpServletRequest request) {

                log.warn("RESOURCE NOT FOUND | path={} | message={}",
                                request.getRequestURI(),
                                ex.getMessage());

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(
                                HttpStatus.NOT_FOUND,
                                ex.getMessage(),
                                request.getRequestURI()));
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<?> handleMissingParams(
                        MissingServletRequestParameterException ex,
                        HttpServletRequest request) {

                log.warn("BAD REQUEST - Missing parameter | path={} | param={}",
                                request.getRequestURI(),
                                ex.getParameterName());

                return ResponseEntity.badRequest().body(errorBody(
                                HttpStatus.BAD_REQUEST,
                                "Required parameter is missing: " + ex.getParameterName(),
                                request.getRequestURI()));
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<?> handleMalformedJson(
                        HttpMessageNotReadableException ex,
                        HttpServletRequest request) {

                log.warn("BAD REQUEST - Malformed JSON | path={} | message={}",
                                request.getRequestURI(),
                                ex.getMessage());

                return ResponseEntity.badRequest().body(errorBody(
                                HttpStatus.BAD_REQUEST,
                                "Malformed JSON request body",
                                request.getRequestURI()));
        }

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
                                "Invalid parameter type: " + ex.getName(),
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

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<?> handleBadCredentials(
                        BadCredentialsException ex,
                        HttpServletRequest request) {

                log.warn(
                                "AUTH FAILED | path={} | method={} | message={}",
                                request.getRequestURI(),
                                request.getMethod(),
                                ex.getMessage());

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                errorBody(
                                                HttpStatus.UNAUTHORIZED,
                                                "Sai tài khoản hoặc mật khẩu",
                                                request.getRequestURI()));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<?> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {

                log.error(
                                "INTERNAL SERVER ERROR | path={} | method={} | rootCause={}",
                                request.getRequestURI(),
                                request.getMethod(),
                                ex.getMessage(),
                                ex);

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Lỗi hệ thống không mong muốn",
                                request.getRequestURI()));
        }

        private Map<String, Object> errorBody(HttpStatus status, String message, String path) {
                Map<String, Object> body = new HashMap<>();
                body.put("success", false);
                body.put("status", status.value());
                body.put("error", status.getReasonPhrase());
                body.put("message", message);
                body.put("path", path);
                body.put("timestamp", OffsetDateTime.now().toString());
                return body;
        }
}
