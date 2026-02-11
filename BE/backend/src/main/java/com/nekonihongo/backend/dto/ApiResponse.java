package com.nekonihongo.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standard API Response Envelope for all backend responses.
 * Ensures consistent response format across all endpoints.
 * 
 * @param <T> The type of data being returned
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;
    private String errorCode;
    private long timestamp;

    /**
     * Create a successful response with data
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * Create a successful response with data and message
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * Create a successful response without data
     */
    public static <T> ApiResponse<T> success() {
        return ApiResponse.<T>builder()
                .success(true)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * Create an error response
     */
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * Create an error response with default error code
     */
    public static <T> ApiResponse<T> error(String message) {
        return error(message, "ERROR");
    }

    /**
     * Create a validation error response
     */
    public static <T> ApiResponse<T> validationError(String message) {
        return error(message, "VALIDATION_ERROR");
    }

    /**
     * Create an unauthorized error response
     */
    public static <T> ApiResponse<T> unauthorized(String message) {
        return error(message, "UNAUTHORIZED");
    }

    /**
     * Create a forbidden error response
     */
    public static <T> ApiResponse<T> forbidden(String message) {
        return error(message, "FORBIDDEN");
    }

    /**
     * Create a not found error response
     */
    public static <T> ApiResponse<T> notFound(String message) {
        return error(message, "NOT_FOUND");
    }

    /**
     * Create a server error response
     */
    public static <T> ApiResponse<T> serverError(String message) {
        return error(message, "SERVER_ERROR");
    }
}