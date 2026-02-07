package com.nekonihongo.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@ControllerAdvice
@Slf4j
public class RestExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(HttpServletRequest req, IllegalArgumentException ex) {
        log.warn("Bad request on {} {} - {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNotFound(HttpServletRequest req, NoSuchElementException ex) {
        log.info("Not found on {} {} - {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(HttpServletRequest req, Exception ex) {
        log.error("Unhandled exception on {} {}", req.getMethod(), req.getRequestURI(), ex);
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", "Internal Server Error");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
