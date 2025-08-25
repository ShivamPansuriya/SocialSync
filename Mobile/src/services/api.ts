import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '@/config/api';

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request configuration
interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * API Client for React Native
 * Handles authentication, token refresh, and error handling
 */
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL || '';
    this.defaultTimeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Get stored access token
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Store tokens
   */
  private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Clear stored tokens
   */
  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.makeRequest('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });

      if (response.success && response.data.accessToken) {
        await this.storeTokens(response.data.accessToken, refreshToken);
        return response.data.accessToken;
      }

      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      return null;
    }
  }

  /**
   * Make HTTP request with automatic token handling
   */
  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig,
    isRetry = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = config.timeout || this.defaultTimeout;

    // Prepare headers
    const headers = {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...config.headers,
    };

    // Add authorization header if token exists
    if (!endpoint.includes('/auth/') || endpoint.includes('/auth/logout')) {
      const accessToken = await this.getAccessToken();
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: config.method,
      headers,
      signal: AbortSignal.timeout(timeout),
    };

    // Add body for non-GET requests
    if (config.body && config.method !== 'GET') {
      requestOptions.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && !isRetry && !endpoint.includes('/auth/')) {
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            // Retry the request with new token
            return this.makeRequest(endpoint, config, true);
          }
        }

        throw new ApiError(data.message || 'Request failed', response.status.toString(), data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        'NETWORK_ERROR',
        error
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, { method: 'POST', body, headers });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, { method: 'DELETE', headers });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, { method: 'PATCH', body, headers });
  }

  /**
   * Upload file
   */
  async uploadFile<T>(
    endpoint: string,
    file: any,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.makeRequest(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Custom error class
class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export { ApiError };
