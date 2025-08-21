# SocialSync Backend

Spring Boot backend for SocialSync following Domain-Driven Design (DDD) guidelines.

## Tech Stack
- Java 17, Spring Boot 3
- Modules: Web, Data JPA, Security, OAuth2 Client, Validation, Actuator
- Database: PostgreSQL + Flyway migrations
- Build: Maven
- Logging: Logback with per-package levels
- Container: Docker (multi-stage build)

## Project Structure (DDD-oriented)
```
src/main/java/com/socialsync/
├── SocialSyncApplication.java
├── config/           # Spring configs (security, beans, etc.)
├── controller/       # REST Controllers
├── service/          # Business logic services
├── repository/       # Data access (Spring Data JPA)
├── entity/           # JPA Entities
├── dto/              # Data Transfer Objects
├── security/         # Security utilities/configs
├── integration/      # External API clients (OAuth providers, social APIs)
└── exception/        # Exception hierarchy & handlers
```

## Run Locally
1. Ensure PostgreSQL is running and env vars are set (or defaults for dev):
   - `DB_URL=jdbc:postgresql://localhost:5432/socialsync_dev`
   - `DB_USER=postgres`
   - `DB_PASSWORD=postgres`
   - `SPRING_PROFILES_ACTIVE=dev`
2. Build & run:
```
mvn spring-boot:run
```

## Docker
Build and run with Docker:
```
docker build -t socialsync-backend ./Backend
docker run --rm -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/socialsync_dev \
  -e DB_USER=postgres -e DB_PASSWORD=postgres \
  socialsync-backend
```

## Environment Profiles
- `application-dev.properties`: verbose SQL logging, local DB defaults
- `application-staging.properties`: secure defaults, extended actuator
- `application-prod.properties`: strict, logs at INFO, details hidden

## Notes & Decisions
- Externalized configuration only (no secrets committed)
- Layered jar for better Docker caching
- Basic SecurityFilterChain: health and actuator open; others secured by default

## Health Check
GET http://localhost:8080/health → `OK`

