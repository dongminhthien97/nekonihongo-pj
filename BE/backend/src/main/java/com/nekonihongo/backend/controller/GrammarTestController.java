// src/main/java/com/nekonihongo/backend/controller/GrammarTestController.java (fixed với @RequestParam rõ ràng)
package com.nekonihongo.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class GrammarTestController {

    // Fix lỗi parameter name không resolve được
    // Thêm @RequestParam với value rõ ràng (hoặc name)
    @GetMapping("/grammar-tests")
    public ResponseEntity<?> getGrammarTests(
            @RequestParam(value = "filter", required = false, defaultValue = "all") String filter,
            @RequestParam(value = "search", required = false, defaultValue = "") String search) {

        // TODO: Implement real logic sau khi có entity/repository
        // Hiện tại trả empty để frontend load ok
        Map<String, Object> response = new HashMap<>();
        response.put("data", Collections.emptyList());
        response.put("total", 0);

        return ResponseEntity.ok(response);
    }
}