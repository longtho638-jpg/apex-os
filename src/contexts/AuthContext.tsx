'use client';

/**
 * Authentication context for React
 * Manages user login state and JWT tokens
 * Refactored for security: Uses HttpOnly cookies (via API) instead of client-side storage.
 */

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getApiUrl } from '@/lib/api/config';
import { logger } from '@/lib/logger';

// --- Types ---

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null; // Kept for type compatibility, but will be null or dummy
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

// --- Context ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Side Effects ---

  // Load user from API on mount (verifies HttpOnly cookie)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseUrl = getApiUrl();
        // Call API to verify session (browser sends HttpOnly cookie automatically)
        // Use generic /auth/me to avoid 401s for non-admins
        const res = await fetch(`${baseUrl}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email,
              full_name: 'User', // Placeholder
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        logger.error('Auth check failed', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // --- Actions ---

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // MFA Flow
        if (data.mfaRequired) {
          sessionStorage.setItem('mfaTempToken', data.token); // Keep MFA temp token in session storage (short lived)
          sessionStorage.setItem('mfaEmail', email);
          sessionStorage.setItem('mfaUserId', data.user.id);

          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login/mfa';
          }
          return true;
        }

        // Standard Flow
        // Backend sets HttpOnly cookie. We just update state.
        setUser(data.user);
        logger.debug('Login successful (HttpOnly cookie set by backend).');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Login error:', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await response.json();

      if (data.success) {
        // Backend sets HttpOnly cookie
        setUser(data.user);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Signup error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const baseUrl = getApiUrl();
      await fetch(`${baseUrl}/auth/logout`, { method: 'POST' });
    } catch (e) {
      logger.error('Logout API call failed', e);
    } finally {
      setUser(null);
      // Optional: Clear any application specific state
    }
  }, []);

  // --- Memoized Context Value ---

  const contextValue = useMemo(
    () => ({
      user,
      token: null, // Token is no longer exposed to client
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      loading,
    }),
    [user, login, signup, logout, loading],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// --- Hook ---

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
