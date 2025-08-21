# Backend Dockerfile for containerized development and deployment
# Multi-stage build for smaller runtime image

# Build stage
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
# Pre-fetch dependencies for caching
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# Runtime stage
FROM eclipse-temurin:17-jre
ENV JAVA_OPTS=""
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Use Spring profile via env var SPRING_PROFILES_ACTIVE
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

