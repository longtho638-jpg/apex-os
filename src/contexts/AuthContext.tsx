"use client";

/**
 * Authentication context for React
 * Manages user login state and JWT tokens
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api/config';
import Cookies from 'js-cookie';

interface User {
    id: string;
    email: string;
    full_name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string, fullName?: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from API on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check for token in localStorage or cookies
                const storedToken = localStorage.getItem('apex_token') || Cookies.get('sb-access-token');
                
                if (!storedToken) {
                    setLoading(false);
                    return;
                }

                const baseUrl = getApiUrl();
                const res = await fetch(`${baseUrl}/admin/me`, {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser({
                            id: data.admin.id,
                            email: data.admin.email,
                            full_name: 'Admin' // Placeholder as admin_users might not have full_name
                        });
                        // Sync token state if it wasn't set (e.g. page refresh)
                        setToken(storedToken);
                    } else {
                        // Token invalid
                        localStorage.removeItem('apex_token');
                        localStorage.removeItem('apex_user');
                        Cookies.remove('sb-access-token');
                    }
                } else {
                    // Token invalid or server error
                     if (res.status === 401) {
                        localStorage.removeItem('apex_token');
                        localStorage.removeItem('apex_user');
                        Cookies.remove('sb-access-token');
                    }
                }
            } catch (err) {
                console.error('Auth check failed', err);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // ...

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const baseUrl = getApiUrl();
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();


            if (data.success) {
                // Check if MFA is required for this user (returned from API)
                if (data.mfaRequired) {
                    // Store temporary state for MFA verification step
                    sessionStorage.setItem('mfaTempToken', data.token);
                    sessionStorage.setItem('mfaEmail', email);
                    sessionStorage.setItem('mfaUserId', data.user.id);

                    // Redirect to MFA verification page (don't set auth token yet)
                    if (typeof window !== 'undefined') {
                        window.location.href = '/admin/login/mfa';
                    }
                    return true;
                }

                // Normal login flow (no MFA required)
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('apex_token', data.token);
                localStorage.setItem('apex_user', JSON.stringify(data.user));

                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const signup = async (email: string, password: string, fullName?: string): Promise<boolean> => {
        try {
            const baseUrl = getApiUrl();
            const response = await fetch(`${baseUrl}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name: fullName })
            });

            const data = await response.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('apex_token', data.token);
                localStorage.setItem('apex_user', JSON.stringify(data.user));
                Cookies.set('sb-access-token', data.token, { expires: 7, path: '/' });
                console.log('🍪 Cookie set! Current cookies:', document.cookie);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            const baseUrl = getApiUrl();
            await fetch(`${baseUrl}/auth/logout`, { method: 'POST' });
        } catch (e) {
            console.error('Logout API call failed', e);
        }

        setToken(null);
        setUser(null);
        localStorage.removeItem('apex_token');
        localStorage.removeItem('apex_user');
        Cookies.remove('sb-access-token');
        Cookies.remove('apex_session');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            signup,
            logout,
            isAuthenticated: !!token,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
