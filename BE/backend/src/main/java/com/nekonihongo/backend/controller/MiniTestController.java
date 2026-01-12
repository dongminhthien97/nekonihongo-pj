// src/main/java/com/nekonihongo/backend/controller/MiniTestController.java (controller dùng service)
package com.nekonihongo.backend.controller;

import com.nekonihongo.backend.service.MiniTestSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/mini-test")
@PreAuthorize("hasRole('ADMIN')")
public class MiniTestController {

    @Autowired
    private MiniTestSubmissionService service;

    @GetMapping("/pending-count")
    public ResponseEntity<?> getPendingCount() {
        try {
            long count = service.getPendingCount();
            return ResponseEntity.ok().body(new PendingCountResponse(count));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi server");
        }
    }

    private static class PendingCountResponse {
        private final long count;

        public PendingCountResponse(long count) {
            this.count = count;
        }

        public long getCount() {
            return count;
        }
    }
}