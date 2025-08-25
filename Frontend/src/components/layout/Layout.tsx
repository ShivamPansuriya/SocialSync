import React from 'react';
import { useRouter } from 'next/router';
import { Navigation } from './Navigation';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component that wraps pages with navigation and error boundary
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  
  // Pages that don't need navigation (login, register, etc.)
  const publicPages = ['/login', '/register', '/forgot-password', '/'];
  const isPublicPage = publicPages.includes(router.pathname);

  if (isPublicPage) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Navigation>
        {children}
      </Navigation>
    </ErrorBoundary>
  );
};
