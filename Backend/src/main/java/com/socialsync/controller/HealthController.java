package com.socialsync.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check controller for monitoring application status.
 * 
 * This controller provides endpoints for checking the health and status
 * of the SocialSync backend application. It's useful for load balancers,
 * monitoring systems, and development testing.
 * 
 * @author SocialSync Team
 * @version 1.0.0
 * @since 1.0.0
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    @Value("${app.name:SocialSync}")
    private String applicationName;

    @Value("${app.version:1.0.0}")
    private String applicationVersion;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    /**
     * Basic health check endpoint.
     * 
     * @return ResponseEntity with health status
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("application", applicationName);
        health.put("version", applicationVersion);
        health.put("profile", activeProfile);
        
        return ResponseEntity.ok(health);
    }

    /**
     * Detailed status endpoint with application information.
     * 
     * @return ResponseEntity with detailed application status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> status = new HashMap<>();
        status.put("application", applicationName);
        status.put("version", applicationVersion);
        status.put("profile", activeProfile);
        status.put("timestamp", LocalDateTime.now());
        status.put("uptime", getUptime());
        status.put("java_version", System.getProperty("java.version"));
        status.put("spring_boot_version", getClass().getPackage().getImplementationVersion());
        
        return ResponseEntity.ok(status);
    }

    /**
     * Simple ping endpoint for basic connectivity testing.
     * 
     * @return ResponseEntity with ping response
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "pong");
        response.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get application uptime in milliseconds.
     * 
     * @return uptime in milliseconds
     */
    private long getUptime() {
        return System.currentTimeMillis() - 
               java.lang.management.ManagementFactory.getRuntimeMXBean().getStartTime();
    }
}
