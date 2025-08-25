import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { authApi, userApi } from '@/services/api';
import { queryKeys } from '@/lib/react-query';

// User type definition
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth context type definition
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if user is authenticated by checking for tokens
  const isAuthenticated = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem('accessToken') && localStorage.getItem('refreshToken'));
  }, []);

  // Fetch user profile if authenticated
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery(
    queryKeys.userProfile(),
    () => userApi.getProfile().then(res => res.data.data),
    {
      enabled: isAuthenticated && isInitialized,
      retry: false,
      onError: () => {
        // If profile fetch fails, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      },
    }
  );

  // Login mutation
  const loginMutation = useMutation(authApi.login, {
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      queryClient.setQueryData(queryKeys.userProfile(), user);
      router.push('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation(authApi.register, {
    onSuccess: () => {
      router.push('/login');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      throw error;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation(authApi.logout, {
    onSettled: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      router.push('/login');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation(userApi.updateProfile, {
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.userProfile(), response.data.data);
    },
    onError: (error: any) => {
      console.error('Profile update failed:', error);
      throw error;
    },
  });

  // Initialize auth state on mount
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const value = useMemo(
    () => ({
      user: userProfile || null,
      isAuthenticated: isAuthenticated && !!userProfile,
      isLoading: !isInitialized || (isAuthenticated && isLoadingProfile),
      login: async (credentials: { email: string; password: string }) => {
        await loginMutation.mutateAsync(credentials);
      },
      register: async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
        await registerMutation.mutateAsync(userData);
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
      updateProfile: async (userData: Partial<User>) => {
        await updateProfileMutation.mutateAsync(userData);
      },
    }),
    [
      userProfile,
      isAuthenticated,
      isInitialized,
      isLoadingProfile,
      loginMutation,
      registerMutation,
      logoutMutation,
      updateProfileMutation,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

