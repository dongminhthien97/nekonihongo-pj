package com.nekonihongo.backend.config;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ApiErrorController implements ErrorController {

    @RequestMapping(value = "/error", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object statusAttr = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int status = statusAttr != null ? Integer.parseInt(statusAttr.toString()) : 500;

        Object messageAttr = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        String message = messageAttr != null ? messageAttr.toString() : "Unexpected error";

        Object pathAttr = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        String path = pathAttr != null ? pathAttr.toString() : "";

        Map<String, Object> body = Map.of(
                "status", status,
                "error", status == 404 ? "Not Found" : "Error",
                "message", message,
                "path", path
        );

        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON).body(body);
    }
}
