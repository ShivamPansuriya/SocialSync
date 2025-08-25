# Multi-stage Dockerfile for SocialSync Backend
# This Dockerfile creates optimized images for both development and production

# =============================================================================
# Build Stage
# =============================================================================
FROM eclipse-temurin:21-jdk-alpine AS builder

# Set working directory
WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy Maven configuration files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B

# =============================================================================
# Development Stage
# =============================================================================
FROM eclipse-temurin:21-jdk-alpine AS development

# Install development tools
RUN apk add --no-cache curl netcat-openbsd

# Create app user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Install Maven for development
RUN apk add --no-cache maven

# Copy Maven configuration
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Download dependencies
RUN mvn dependency:go-offline -B

# Create directories
RUN mkdir -p /app/logs /app/uploads && \
    chown -R appuser:appgroup /app

# Switch to app user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/health || exit 1

# Development command (will be overridden by docker-compose)
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.profiles=dev"]

# =============================================================================
# Production Stage
# =============================================================================
FROM eclipse-temurin:21-jre-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache curl tzdata && \
    cp /usr/share/zoneinfo/UTC /etc/localtime && \
    echo "UTC" > /etc/timezone

# Create app user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Create directories and set permissions
RUN mkdir -p /app/logs /app/uploads && \
    chown -R appuser:appgroup /app

# Switch to app user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/health || exit 1

# JVM optimization for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+UseG1GC \
               -XX:+UseStringDeduplication \
               -XX:+OptimizeStringConcat \
               -Djava.security.egd=file:/dev/./urandom"

# Production command
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

# =============================================================================
# Default target is development
# =============================================================================
FROM development AS default
