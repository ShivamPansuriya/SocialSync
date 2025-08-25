# SocialSync Development Environment Setup

## Overview

This document provides comprehensive instructions for setting up the complete SocialSync development environment across all three platforms:

- **Backend**: Spring Boot REST API with PostgreSQL and Redis
- **Web Frontend**: Next.js with TypeScript and Material-UI
- **Mobile App**: React Native with TypeScript and Redux Toolkit

## Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 10GB free space minimum

### Required Software

#### Backend Development
- **Java**: OpenJDK 21 or Oracle JDK 21
- **Maven**: 3.8.0 or later
- **Docker**: Docker Desktop 4.0+ with Docker Compose
- **IDE**: IntelliJ IDEA, Eclipse, or VS Code with Java extensions

#### Frontend Development
- **Node.js**: 18.0 or later
- **npm**: 8.0 or later (comes with Node.js)
- **IDE**: VS Code, WebStorm, or similar

#### Mobile Development
- **Node.js**: 18.0 or later
- **React Native CLI**: `npm install -g @react-native-community/cli`
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd SocialSync

# Copy environment files
cp .env.example .env
```

### 2. Start Infrastructure Services
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Optional: Start development tools
docker-compose --profile dev up -d pgadmin redis-commander
```

### 3. Backend Setup
```bash
cd Backend

# Install dependencies and compile
mvn clean compile

# Run the application
mvn spring-boot:run

# Or run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 4. Frontend Setup
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Mobile Setup
```bash
cd Mobile

# Install dependencies
npm install

# iOS (macOS only)
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## Detailed Setup Instructions

### Backend Configuration

#### Database Setup
The application uses PostgreSQL as the primary database and Redis for caching.

**Using Docker (Recommended):**
```bash
docker-compose up -d postgres redis
```

**Manual Setup:**
1. Install PostgreSQL 14+
2. Create database: `CREATE DATABASE socialsync;`
3. Create user: `CREATE USER socialsync WITH PASSWORD 'socialsync_dev_password';`
4. Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE socialsync TO socialsync;`

#### Environment Variables
Configure the following in your `.env` file:
```env
DB_PASSWORD=socialsync_dev_password
REDIS_PASSWORD=redis_dev_password
JWT_SECRET=your-secure-jwt-secret-minimum-256-bits
```

#### Running Tests
```bash
cd Backend
mvn test
```

### Frontend Configuration

#### Environment Setup
The frontend uses Next.js with TypeScript and Material-UI.

**Development Server:**
```bash
cd Frontend
npm run dev
```

**Build for Production:**
```bash
npm run build
npm start
```

#### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Mobile Configuration

#### iOS Setup (macOS only)
1. Install Xcode from App Store
2. Install CocoaPods: `sudo gem install cocoapods`
3. Install iOS dependencies:
   ```bash
   cd Mobile/ios
   pod install
   cd ..
   ```
4. Run on simulator: `npm run ios`

#### Android Setup
1. Install Android Studio
2. Configure Android SDK (API level 30+)
3. Create AVD or connect physical device
4. Run: `npm run android`

## Development Workflow

### 1. Starting Development
```bash
# Terminal 1: Start infrastructure
docker-compose up -d postgres redis

# Terminal 2: Start backend
cd Backend && mvn spring-boot:run

# Terminal 3: Start frontend
cd Frontend && npm run dev

# Terminal 4: Start mobile (optional)
cd Mobile && npm start
```

### 2. Making Changes
- Backend changes trigger automatic restart (Spring Boot DevTools)
- Frontend changes trigger hot reload (Next.js)
- Mobile changes trigger fast refresh (React Native)

### 3. Testing
```bash
# Backend tests
cd Backend && mvn test

# Frontend tests
cd Frontend && npm test

# Mobile tests
cd Mobile && npm test
```

## API Documentation

### Backend API
- **Base URL**: `http://localhost:8080/api/v1`
- **Health Check**: `GET /health`
- **API Docs**: `http://localhost:8080/swagger-ui.html` (when running)

### Authentication
The API uses JWT tokens for authentication:
1. Login: `POST /auth/login`
2. Register: `POST /auth/register`
3. Refresh: `POST /auth/refresh`

## Database Management

### Development Tools
- **pgAdmin**: `http://localhost:5050` (admin@socialsync.dev / admin)
- **Redis Commander**: `http://localhost:8081` (admin / admin)

### Migrations
Database migrations are handled by Flyway:
```bash
cd Backend
mvn flyway:migrate
```

## Troubleshooting

### Common Issues

#### Backend
- **Port 8080 in use**: Change `SERVER_PORT` in `.env`
- **Database connection failed**: Ensure PostgreSQL is running
- **Maven not found**: Install Maven or use `./mvnw` wrapper

#### Frontend
- **Port 3000 in use**: Next.js will automatically use next available port
- **Module not found**: Run `npm install`
- **Build errors**: Check TypeScript errors with `npm run type-check`

#### Mobile
- **Metro bundler issues**: Run `npx react-native start --reset-cache`
- **iOS build fails**: Clean build folder in Xcode
- **Android build fails**: Run `cd android && ./gradlew clean`

### Getting Help
1. Check the logs in each terminal
2. Verify all services are running: `docker-compose ps`
3. Check environment variables in `.env`
4. Restart services if needed

## Production Deployment

### Backend
```bash
cd Backend
mvn clean package -Pprod
docker build -t socialsync-backend .
```

### Frontend
```bash
cd Frontend
npm run build
```

### Mobile
```bash
cd Mobile
# iOS
npm run build:ios
# Android
npm run build:android
```

## Next Steps

After successful setup:
1. Explore the codebase structure
2. Review the API documentation
3. Run the test suites
4. Start implementing features according to the project roadmap

For detailed implementation notes, see `Backend/Implementation_notes.md`.
