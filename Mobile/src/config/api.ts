import { Platform } from 'react-native';

// API Configuration for React Native
export const API_CONFIG = {
  // Base URL for different environments
  BASE_URL: __DEV__ 
    ? Platform.select({
        ios: 'http://localhost:8080/api/v1',
        android: 'http://10.0.2.2:8080/api/v1', // Android emulator localhost
      })
    : 'https://api.socialsync.com/api/v1',
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Environment configuration
export const ENV_CONFIG = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  
  // Feature flags
  FEATURES: {
    PUSH_NOTIFICATIONS: true,
    BIOMETRIC_AUTH: true,
    OFFLINE_MODE: true,
    ANALYTICS: !__DEV__,
    CRASH_REPORTING: !__DEV__,
  },
  
  // App configuration
  APP: {
    NAME: 'SocialSync',
    VERSION: '1.0.0',
    BUILD_NUMBER: '1',
  },
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@socialsync/access_token',
  REFRESH_TOKEN: '@socialsync/refresh_token',
  USER_DATA: '@socialsync/user_data',
  THEME_PREFERENCE: '@socialsync/theme',
  ONBOARDING_COMPLETED: '@socialsync/onboarding_completed',
  BIOMETRIC_ENABLED: '@socialsync/biometric_enabled',
  PUSH_TOKEN: '@socialsync/push_token',
} as const;

// Navigation configuration
export const NAVIGATION_CONFIG = {
  INITIAL_ROUTE: 'Splash',
  AUTH_STACK: 'AuthStack',
  MAIN_STACK: 'MainStack',
  
  // Screen names
  SCREENS: {
    SPLASH: 'Splash',
    ONBOARDING: 'Onboarding',
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
    DASHBOARD: 'Dashboard',
    PROFILE: 'Profile',
    SETTINGS: 'Settings',
    POST_CREATE: 'PostCreate',
    POST_LIST: 'PostList',
    ANALYTICS: 'Analytics',
    SOCIAL_ACCOUNTS: 'SocialAccounts',
  },
} as const;

// Theme configuration
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#1976d2',
    SECONDARY: '#dc004e',
    SUCCESS: '#2e7d32',
    WARNING: '#ed6c02',
    ERROR: '#d32f2f',
    INFO: '#0288d1',
    
    // Neutral colors
    WHITE: '#ffffff',
    BLACK: '#000000',
    GREY_50: '#fafafa',
    GREY_100: '#f5f5f5',
    GREY_200: '#eeeeee',
    GREY_300: '#e0e0e0',
    GREY_400: '#bdbdbd',
    GREY_500: '#9e9e9e',
    GREY_600: '#757575',
    GREY_700: '#616161',
    GREY_800: '#424242',
    GREY_900: '#212121',
  },
  
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    ROUND: 50,
  },
  
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
} as const;
