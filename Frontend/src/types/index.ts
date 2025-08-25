// Global type definitions for SocialSync Frontend

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

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  timezone?: string;
  emailVerified: boolean;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  subscriptionPlan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

// Social Media types
export type SocialPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'YOUTUBE' | 'PINTEREST';

export interface SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatform;
  platformUserId: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  accountStatus: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'ERROR';
  permissions: string[];
  platformMetadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Post types
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
export type ContentType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'STORY';

export interface Post {
  id: string;
  userId: string;
  title?: string;
  content: string;
  contentType: ContentType;
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  templateId?: string;
  mediaFiles: MediaFile[];
  hashtags: string[];
  mentions: string[];
  platformSettings: Record<string, any>;
  analyticsData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Media types
export type FileType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

export interface MediaFile {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  fileType: FileType;
  mimeType: string;
  fileSize: number;
  filePath: string;
  thumbnailPath?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  metadata: Record<string, any>;
  tags: string[];
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface AnalyticsData {
  id: string;
  postPlatformId: string;
  metricType: string;
  metricValue: number;
  recordedAt: string;
  platformData: Record<string, any>;
  createdAt: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  password: string;
  confirmPassword: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Navigation types
export interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  disabled?: boolean;
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  borderRadius: number;
  spacing: number;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
