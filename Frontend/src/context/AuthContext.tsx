import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

// Simple auth context for demo/protected routes wiring.
// In production, replace with real JWT-based auth and secure cookies.

type AuthContextType = {
  isAuthenticated: boolean;
  login: (token?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Restore auth state from storage (placeholder)
    setIsAuthenticated(!!localStorage.getItem('auth')); // boolean presence
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      login: (token?: string) => {
        // Store token securely via httpOnly cookie in real app; localStorage for demo only
        if (token) {
          localStorage.setItem('token', token);
        }
        localStorage.setItem('auth', '1');
        setIsAuthenticated(true);
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth');
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

