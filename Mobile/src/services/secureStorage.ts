import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/api';

/**
 * Secure storage service for sensitive data
 * Uses Keychain for iOS and Keystore for Android
 */
export class SecureStorage {
  /**
   * Store sensitive data securely (tokens, passwords, etc.)
   */
  static async setSecureItem(key: string, value: string): Promise<boolean> {
    try {
      await Keychain.setInternetCredentials(key, key, value);
      return true;
    } catch (error) {
      console.error('Error storing secure item:', error);
      return false;
    }
  }

  /**
   * Retrieve sensitive data securely
   */
  static async getSecureItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(key);
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }

  /**
   * Remove sensitive data securely
   */
  static async removeSecureItem(key: string): Promise<boolean> {
    try {
      await Keychain.resetInternetCredentials(key);
      return true;
    } catch (error) {
      console.error('Error removing secure item:', error);
      return false;
    }
  }

  /**
   * Store access token securely
   */
  static async storeAccessToken(token: string): Promise<boolean> {
    return this.setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Retrieve access token securely
   */
  static async getAccessToken(): Promise<string | null> {
    return this.getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Store refresh token securely
   */
  static async storeRefreshToken(token: string): Promise<boolean> {
    return this.setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Retrieve refresh token securely
   */
  static async getRefreshToken(): Promise<string | null> {
    return this.getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Store both tokens securely
   */
  static async storeTokens(accessToken: string, refreshToken: string): Promise<boolean> {
    const accessResult = await this.storeAccessToken(accessToken);
    const refreshResult = await this.storeRefreshToken(refreshToken);
    return accessResult && refreshResult;
  }

  /**
   * Clear all tokens
   */
  static async clearTokens(): Promise<boolean> {
    const accessResult = await this.removeSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshResult = await this.removeSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    // Also clear user data from AsyncStorage
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
    
    return accessResult && refreshResult;
  }

  /**
   * Check if keychain is available
   */
  static async isKeychainAvailable(): Promise<boolean> {
    try {
      const result = await Keychain.getSupportedBiometryType();
      return result !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get supported biometry type
   */
  static async getSupportedBiometryType(): Promise<string | null> {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  }
}

/**
 * Regular storage service for non-sensitive data
 */
export class Storage {
  /**
   * Store data in AsyncStorage
   */
  static async setItem(key: string, value: any): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Error storing item:', error);
      return false;
    }
  }

  /**
   * Retrieve data from AsyncStorage
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  }

  /**
   * Remove data from AsyncStorage
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }

  /**
   * Clear all data from AsyncStorage
   */
  static async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Store user data
   */
  static async storeUserData(userData: any): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.USER_DATA, userData);
  }

  /**
   * Retrieve user data
   */
  static async getUserData<T>(): Promise<T | null> {
    return this.getItem<T>(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Store theme preference
   */
  static async storeThemePreference(theme: 'light' | 'dark' | 'system'): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
  }

  /**
   * Retrieve theme preference
   */
  static async getThemePreference(): Promise<'light' | 'dark' | 'system' | null> {
    return this.getItem<'light' | 'dark' | 'system'>(STORAGE_KEYS.THEME_PREFERENCE);
  }

  /**
   * Store onboarding completion status
   */
  static async storeOnboardingCompleted(completed: boolean): Promise<boolean> {
    return this.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  }

  /**
   * Check if onboarding is completed
   */
  static async isOnboardingCompleted(): Promise<boolean> {
    const completed = await this.getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed === true;
  }
}
