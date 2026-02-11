package com.nekonihongo.backend.config;

import com.nekonihongo.backend.dto.ApiResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@RestControllerAdvice
public class ApiResponseEnvelopeAdvice implements ResponseBodyAdvice<Object> {

    private static final Set<String> ENVELOPE_KEYS = Set.of("success", "data", "message", "errorCode", "timestamp");

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        if (StringHttpMessageConverter.class.isAssignableFrom(converterType)) {
            return false;
        }
        return true;
    }

    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response) {

        String path = request.getURI().getPath();
        if (path == null) {
            return wrap(body, response);
        }

        if (path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/swagger-resources")
                || path.startsWith("/webjars")
                || path.equals("/error")) {
            return body;
        }

        return wrap(body, response);
    }

    private Object wrap(Object body, ServerHttpResponse response) {
        if (body == null) {
            return ApiResponse.success(null);
        }
        if (body instanceof ApiResponse<?>) {
            return body;
        }

        if (body instanceof Map<?, ?> map && map.containsKey("success") && map.get("success") instanceof Boolean) {
            boolean success = (Boolean) map.get("success");
            Object explicitData = map.containsKey("data") ? map.get("data") : null;

            Map<String, Object> extra = new LinkedHashMap<>();
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (entry.getKey() instanceof String key && !ENVELOPE_KEYS.contains(key)) {
                    extra.put(key, entry.getValue());
                }
            }

            Object data;
            if (extra.isEmpty()) {
                data = map.containsKey("data") ? explicitData : null;
            } else {
                Map<String, Object> composite = new LinkedHashMap<>();
                if (map.containsKey("data")) {
                    composite.put("data", explicitData);
                }
                composite.putAll(extra);
                data = composite;
            }

            String message = map.get("message") instanceof String s ? s : null;
            String errorCode = map.get("errorCode") instanceof String s ? s : null;
            Long timestamp = null;
            if (map.get("timestamp") instanceof Number n) {
                timestamp = n.longValue();
            }

            Integer statusCode = null;
            if (response instanceof ServletServerHttpResponse servletResponse) {
                statusCode = servletResponse.getServletResponse().getStatus();
            }
            if (!success && statusCode != null && statusCode >= 500) {
                message = "Internal server error";
                if (errorCode == null) {
                    errorCode = "INTERNAL_ERROR";
                }
            } else if (!success && errorCode == null && message != null) {
                int idx = message.indexOf(':');
                if (idx > 0) {
                    String trimmed = message.substring(0, idx).trim();
                    if (!trimmed.isBlank()) {
                        message = trimmed;
                    }
                }
                if ("Error".equalsIgnoreCase(message) || "Lỗi".equalsIgnoreCase(message)) {
                    message = "Request failed";
                }
                errorCode = "ERROR";
            }

            return ApiResponse.builder()
                    .success(success)
                    .data(data)
                    .message(message)
                    .errorCode(errorCode)
                    .timestamp(timestamp != null ? timestamp : System.currentTimeMillis())
                    .build();
        }

        return ApiResponse.success(body);
    }
}