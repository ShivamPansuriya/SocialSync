import TouchID from 'react-native-touch-id';
import { Alert, Platform } from 'react-native';
import { SecureStorage } from './secureStorage';
import { STORAGE_KEYS } from '@/config/api';

export type BiometryType = 'TouchID' | 'FaceID' | 'Fingerprint' | null;

/**
 * Biometric authentication service
 * Handles Touch ID, Face ID, and Android fingerprint authentication
 */
export class BiometricAuth {
  /**
   * Check if biometric authentication is supported
   */
  static async isSupported(): Promise<boolean> {
    try {
      const biometryType = await TouchID.isSupported();
      return biometryType !== false;
    } catch (error) {
      console.log('Biometric authentication not supported:', error);
      return false;
    }
  }

  /**
   * Get supported biometry type
   */
  static async getSupportedBiometryType(): Promise<BiometryType> {
    try {
      const biometryType = await TouchID.isSupported();
      if (biometryType === true) {
        return Platform.OS === 'ios' ? 'TouchID' : 'Fingerprint';
      }
      return biometryType as BiometryType;
    } catch (error) {
      console.log('Error getting biometry type:', error);
      return null;
    }
  }

  /**
   * Authenticate using biometrics
   */
  static async authenticate(reason?: string): Promise<boolean> {
    try {
      const isSupported = await this.isSupported();
      if (!isSupported) {
        throw new Error('Biometric authentication not supported');
      }

      const biometryType = await this.getSupportedBiometryType();
      const defaultReason = this.getDefaultReason(biometryType);

      await TouchID.authenticate(reason || defaultReason, {
        title: 'Authentication Required',
        subtitle: 'Use your biometric to authenticate',
        description: reason || defaultReason,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        passcodeFallback: true,
        showErrorMessage: true,
        imageColor: '#1976d2',
        imageErrorColor: '#d32f2f',
      });

      return true;
    } catch (error: any) {
      console.log('Biometric authentication failed:', error);
      
      // Handle specific error cases
      if (error.name === 'LAErrorUserCancel' || error.name === 'UserCancel') {
        // User cancelled authentication
        return false;
      } else if (error.name === 'LAErrorUserFallback' || error.name === 'UserFallback') {
        // User chose to use passcode
        return false;
      } else if (error.name === 'LAErrorBiometryNotAvailable') {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device.'
        );
        return false;
      } else if (error.name === 'LAErrorBiometryNotEnrolled') {
        Alert.alert(
          'Biometric Not Set Up',
          'Please set up biometric authentication in your device settings.'
        );
        return false;
      }

      throw error;
    }
  }

  /**
   * Check if biometric authentication is enabled for the app
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStorage.getSecureItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  static async enableBiometric(): Promise<boolean> {
    try {
      const isSupported = await this.isSupported();
      if (!isSupported) {
        Alert.alert(
          'Not Supported',
          'Biometric authentication is not supported on this device.'
        );
        return false;
      }

      // Test authentication first
      const authenticated = await this.authenticate('Enable biometric authentication for SocialSync');
      if (!authenticated) {
        return false;
      }

      // Store the preference
      await SecureStorage.setSecureItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      return true;
    } catch (error) {
      console.error('Error enabling biometric authentication:', error);
      Alert.alert(
        'Error',
        'Failed to enable biometric authentication. Please try again.'
      );
      return false;
    }
  }

  /**
   * Disable biometric authentication for the app
   */
  static async disableBiometric(): Promise<boolean> {
    try {
      await SecureStorage.removeSecureItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return true;
    } catch (error) {
      console.error('Error disabling biometric authentication:', error);
      return false;
    }
  }

  /**
   * Authenticate for app access (if biometric is enabled)
   */
  static async authenticateForAppAccess(): Promise<boolean> {
    try {
      const isBiometricEnabled = await this.isBiometricEnabled();
      if (!isBiometricEnabled) {
        return true; // Biometric not enabled, allow access
      }

      return await this.authenticate('Authenticate to access SocialSync');
    } catch (error) {
      console.error('Error during app access authentication:', error);
      return false;
    }
  }

  /**
   * Get default authentication reason based on biometry type
   */
  private static getDefaultReason(biometryType: BiometryType): string {
    switch (biometryType) {
      case 'TouchID':
        return 'Use your Touch ID to authenticate';
      case 'FaceID':
        return 'Use your Face ID to authenticate';
      case 'Fingerprint':
        return 'Use your fingerprint to authenticate';
      default:
        return 'Use your biometric to authenticate';
    }
  }

  /**
   * Show biometric setup prompt
   */
  static showBiometricSetupPrompt(): void {
    Alert.alert(
      'Enable Biometric Authentication',
      'Would you like to enable biometric authentication for faster and more secure access to SocialSync?',
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Enable',
          onPress: async () => {
            await this.enableBiometric();
          },
        },
      ]
    );
  }
}
