# SocialSync Mobile Development Setup

## Prerequisites

### iOS Development
- macOS (required for iOS development)
- Xcode 14.0 or later
- iOS Simulator
- CocoaPods (`sudo gem install cocoapods`)

### Android Development
- Android Studio
- Android SDK (API level 30 or higher)
- Android Virtual Device (AVD) or physical device
- Java Development Kit (JDK) 11 or later

### General Requirements
- Node.js 18.0 or later
- npm 8.0 or later
- React Native CLI (`npm install -g @react-native-community/cli`)

## Setup Instructions

### 1. Install Dependencies
```bash
cd Mobile
npm install
```

### 2. iOS Setup (macOS only)
```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..

# Run on iOS Simulator
npm run ios
```

### 3. Android Setup
```bash
# Start Metro bundler
npm start

# In another terminal, run on Android emulator
npm run android
```

## Development Scripts

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Build Scripts

### Debug Builds
- `npm run android` - Android debug build
- `npm run ios` - iOS debug build

### Release Builds
- `npm run build:android` - Android release build
- `npm run build:ios` - iOS release build

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Build the app for testing
npm run test:e2e:build

# Run E2E tests
npm run test:e2e
```

## Troubleshooting

### Common iOS Issues
1. **CocoaPods issues**: Run `cd ios && pod install --repo-update`
2. **Build failures**: Clean build folder in Xcode (Product → Clean Build Folder)
3. **Simulator issues**: Reset simulator (Device → Erase All Content and Settings)

### Common Android Issues
1. **Gradle issues**: Run `cd android && ./gradlew clean`
2. **SDK issues**: Ensure Android SDK is properly installed and ANDROID_HOME is set
3. **Emulator issues**: Create a new AVD or restart existing one

### Metro Bundler Issues
1. **Cache issues**: Run `npx react-native start --reset-cache`
2. **Port conflicts**: Kill process on port 8081 or use different port

## Environment Variables

Create a `.env` file in the Mobile directory:
```
API_BASE_URL=http://localhost:8080/api/v1
ENVIRONMENT=development
```

## Code Signing (iOS)

For iOS development, you'll need:
1. Apple Developer Account
2. Provisioning Profile
3. Code Signing Certificate

Configure these in Xcode under Project Settings → Signing & Capabilities.

## Debugging

### React Native Debugger
1. Install React Native Debugger
2. Enable Debug JS Remotely in the app
3. Open React Native Debugger

### Flipper
1. Install Flipper desktop app
2. Run the app in debug mode
3. Connect to Flipper for advanced debugging

## Performance Monitoring

The app includes:
- Crashlytics for crash reporting
- Firebase Analytics for user analytics
- Performance monitoring tools

These are configured in the Firebase console and require proper setup for production use.
