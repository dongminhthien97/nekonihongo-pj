package com.nekonihongo.backend.service;

import org.springframework.stereotype.Service;

/**
 * Service to track application startup state.
 * This helps handle cold start scenarios and return appropriate HTTP status
 * codes.
 */
@Service
public class ApplicationStateService {

    private volatile boolean isStartupComplete = false;

    public void markStartupComplete() {
        this.isStartupComplete = true;
    }

    public boolean isStartupComplete() {
        return this.isStartupComplete;
    }
}