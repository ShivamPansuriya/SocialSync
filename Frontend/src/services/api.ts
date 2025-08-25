import axios, { AxiosError, AxiosResponse } from 'axios';

// API service abstraction; base URL from env for flexibility across environments
// NEXT_PUBLIC_API_BASE_URL is used at build/runtime by Next.js
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API response types
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

// Auth API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>('/auth/login', credentials),

  register: (userData: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<ApiResponse<{ user: any }>>('/auth/register', userData),

  logout: () =>
    api.post<ApiResponse>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse>('/auth/reset-password', { token, password }),
};

// User API endpoints
export const userApi = {
  getProfile: () =>
    api.get<ApiResponse<any>>('/users/profile'),

  updateProfile: (userData: any) =>
    api.put<ApiResponse<any>>('/users/profile', userData),

  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<{ imageUrl: string }>>('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Health check endpoint
export const healthApi = {
  check: () =>
    api.get<ApiResponse>('/health'),
};

