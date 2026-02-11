package com.nekonihongo.backend.config;

import com.nekonihongo.backend.dto.ApiResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * Global Response Handler to wrap all controller responses into ApiResponse<T>
 * envelope.
 * Ensures consistent response format across all endpoints.
 */
@RestControllerAdvice
public class GlobalResponseHandler implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Don't wrap if already ApiResponse or void methods
        return !returnType.getParameterType().equals(ApiResponse.class) &&
                !returnType.getParameterType().equals(void.class) &&
                !returnType.getParameterType().equals(Void.class);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request, ServerHttpResponse response) {

        // If body is null, return success ApiResponse with null data
        if (body == null) {
            return ApiResponse.success();
        }

        // If body is already ApiResponse, return as-is
        if (body instanceof ApiResponse) {
            return body;
        }

        // Wrap the body in ApiResponse.success()
        return ApiResponse.success(body);
    }
}