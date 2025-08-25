package com.socialsync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main Spring Boot application class for SocialSync.
 * 
 * This class serves as the entry point for the SocialSync backend application.
 * It enables various Spring Boot features including:
 * - JPA Auditing for automatic timestamp management
 * - Caching for performance optimization
 * - Async processing for non-blocking operations
 * - Scheduling for background tasks
 * - Transaction management for data consistency
 * - Configuration properties scanning
 * 
 * @author SocialSync Team
 * @version 1.0.0
 * @since 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableTransactionManagement
@ConfigurationPropertiesScan
public class SocialSyncApplication {

    /**
     * Main method to start the SocialSync application.
     * 
     * @param args command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(SocialSyncApplication.class, args);
    }
}
