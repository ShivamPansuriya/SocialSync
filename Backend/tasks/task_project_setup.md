# Task: Project Structure & Technology Stack Setup

## 1. Scope / Objective
- **What:** Initialize complete Spring Boot backend, React TypeScript web frontend, and React Native mobile application with all necessary dependencies and configurations
- **Why:** Establish a solid foundation that supports the entire application lifecycle across web and mobile platforms without requiring major architectural changes
- **Context:** This is the foundational task that enables all subsequent development work in the SocialSync system across all platforms

## 2. Prerequisites & Dependencies (install if absent)
- Java 21+ installed on development machine
- Node.js 18+(or latest version) and npm/yarn installed
- React Native CLI and development environment
- Xcode (for iOS development) and Android Studio (for Android development)
- Docker and Docker Compose installed
- PostgreSQL 14+(or latest version) available (local)
- Redis available (local or containerized)
- Git repository initialized

## 3. Technical Specifications
- **Backend Framework:** Spring Boot latest version with Java 21
- **Web Frontend Framework:** React 18+(or latest version) with TypeScript 5+(or latest version)
- **Mobile Framework:** React Native 0.72(or latest version)+ with TypeScript
- **Database:** PostgreSQL 14+(or latest version) with Redis caching
- **Build Tools:** Maven for backend, Vite for web frontend, Metro for mobile
- **Containerization:** Docker with multi-stage builds
- **Package Structure:** Domain-driven design with clear separation of concerns

## 4. Step-by-Step Implementation Guide

### Backend Setup (Spring Boot)
1. **Initialize Spring Boot Project**
   - Use Spring Initializr to create project with dependencies: Web, JPA, Security, OAuth2, PostgreSQL, Validation, Actuator, Redis
   - Set up Maven configuration with proper Java version and encoding
   - Configure application.properties for multiple environments (dev, staging, prod)

2. **Create Package Structure**
   ```
   src/main/java/com/socialsync/
   ├── config/          # Configuration classes
   ├── controller/      # REST controllers  
   ├── service/         # Business logic services
   ├── repository/      # Data access layer
   ├── entity/          # JPA entities
   ├── dto/             # Data transfer objects
   ├── security/        # Security configuration
   ├── integration/     # External API clients
   ├── exception/       # Custom exceptions
   └── util/            # Utility classes
   ```

3. **Configure Application Properties**
   - Set up database connection properties
   - Configure JWT token settings
   - Set up Redis connection
   - Configure logging levels
   - Set up actuator endpoints

4. **Set Up Docker Configuration**
   - Create Dockerfile with multi-stage build
   - Create docker-compose.yml for development environment
   - Include PostgreSQL and Redis services

### Web Frontend Setup (React TypeScript)
5. **Initialize React Project**
   - Create React app with TypeScript template
   - Install UI library (Material-UI or Ant Design)
   - Set up routing with React Router
   - Configure state management (React Query + Context API)

6. **Create Web Frontend Folder Structure**
   ```
   Frontend/src/
   ├── components/      # Reusable UI components
   ├── pages/           # Page components
   ├── hooks/           # Custom React hooks
   ├── services/        # API service layer
   ├── store/           # State management
   ├── types/           # TypeScript type definitions
   ├── utils/           # Utility functions
   └── assets/          # Static assets
   ```

7. **Configure Web Development Tools**
   - Set up ESLint and Prettier
   - Configure Husky for pre-commit hooks
   - Set up environment variables handling
   - Configure build optimization

### Mobile App Setup (React Native)
8. **Initialize React Native Project**
   - Create React Native project with TypeScript template
   - Install navigation library (React Navigation 6)
   - Set up state management (Redux Toolkit with RTK Query)
   - Configure UI library (React Native Elements or NativeBase)

9. **Create Mobile App Folder Structure**
   ```
   Mobile/src/
   ├── components/      # Reusable mobile components
   ├── screens/         # Screen components
   ├── navigation/      # Navigation configuration
   ├── services/        # API and native services
   ├── hooks/           # Custom React hooks
   ├── store/           # State management
   ├── types/           # TypeScript type definitions
   ├── utils/           # Utility functions
   └── assets/          # Static assets
   ```

10. **Configure Mobile Development Environment**
    - Set up iOS development environment (Xcode, CocoaPods)
    - Configure Android development environment (Android Studio, SDK)
    - Install React Native debugging tools (Flipper)
    - Set up code signing for iOS and Android

### Environment Configuration
11. **Set Up Multi-Environment Support**
    - Create application-dev.yml, application-staging.yml, application-prod.yml
    - Set up environment-specific web frontend configurations
    - Configure mobile app environment variables and build configurations
    - Configure Docker environments
    - Set up CI/CD pipeline basics for all platforms

12. **Configure Security Basics**
    - Set up CORS configuration for web and mobile API access
    - Configure security headers
    - Set up basic JWT configuration
    - Configure HTTPS for production
    - Set up mobile app security (certificate pinning, keychain storage)

13. **Set Up Monitoring and Logging**
    - Configure application logging with different levels
    - Set up actuator endpoints for health checks
    - Configure basic monitoring setup
    - Set up error tracking preparation for web and mobile
    - Configure crash reporting for mobile apps (Crashlytics)

## 5. Code Examples & References

### Application.properties Configuration
```yaml
spring.profiles.active: dev
datasource:
    url: jdbc:postgresql://localhost:5432/socialsync
    username: ${DB_USERNAME:socialsync}
    password: ${DB_PASSWORD:password}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

### Docker Compose Example
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: socialsync
      POSTGRES_USER: socialsync
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Mobile App Configuration Examples

#### React Native Package.json
```json
{
  "name": "SocialSyncMobile",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.1.0",
    "react-native-keychain": "^8.1.0",
    "@react-native-firebase/app": "^18.0.0",
    "@react-native-firebase/messaging": "^18.0.0"
  }
}
```

#### Metro Configuration
```javascript
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

## 6. Testing Requirements
- **Unit Tests:** Basic configuration tests for Spring Boot
- **Integration Tests:** Database connectivity tests
- **Web Frontend Tests:** Component rendering tests with React Testing Library
- **Mobile App Tests:** Component and screen tests with React Native Testing Library
- **Build Tests:** Verify Docker builds and mobile app builds work correctly
- **Environment Tests:** Verify all environments can start successfully across all platforms

## 7. Acceptance Criteria (Definition of Done)
- [ ] Backend Spring Boot application starts successfully in all environments
- [ ] Web frontend React application builds and runs without errors
- [ ] Mobile React Native app builds and runs on both iOS and Android
- [ ] Database connection established and working
- [ ] Redis connection established and working
- [ ] Docker containers build and run successfully
- [ ] Basic health check endpoints responding
- [ ] All development tools (linting, formatting) configured and working for all platforms
- [ ] Environment-specific configurations working for web and mobile
- [ ] Basic security headers configured
- [ ] Logging configuration working properly
- [ ] Mobile app development environment fully configured
- [ ] Code signing configured for iOS and Android builds

## 8. Best Practices Reminders
- **Configuration Management:** Never hardcode sensitive values; use environment variables
- **Security First:** Configure security settings from the beginning, not as an afterthought
- **Documentation:** Document all configuration decisions and setup steps
- **Version Control:** Ensure all configuration files are properly versioned
- **Dependency Management:** Keep dependencies up to date and document version choices
- **Error Handling:** Set up proper error handling and logging from the start
- **Performance:** Configure appropriate connection pools and caching from the beginning
