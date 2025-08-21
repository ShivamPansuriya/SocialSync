package com.socialsync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for SocialSync Spring Boot application.
 * Architectural decision: Single backend app now, modular packages allow future split into microservices.
 */
@SpringBootApplication
public class SocialSyncApplication {
    public static void main(String[] args) {
        SpringApplication.run(SocialSyncApplication.class, args);
    }
}

