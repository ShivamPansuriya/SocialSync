import React from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

/**
 * React Query provider component that wraps the app with query client
 */
export const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

// Query keys for consistent caching
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  
  // User
  user: ['user'] as const,
  userProfile: () => [...queryKeys.user, 'profile'] as const,
  
  // Health
  health: ['health'] as const,
  
  // Posts (for future use)
  posts: ['posts'] as const,
  post: (id: string) => [...queryKeys.posts, id] as const,
  
  // Social Accounts (for future use)
  socialAccounts: ['socialAccounts'] as const,
  socialAccount: (id: string) => [...queryKeys.socialAccounts, id] as const,
  
  // Analytics (for future use)
  analytics: ['analytics'] as const,
  
  // Media (for future use)
  media: ['media'] as const,
};

// Export query client for use in other parts of the app
export { queryClient };

// Re-export React Query hooks for convenience
export { useQuery, useMutation, useQueryClient } from 'react-query';
