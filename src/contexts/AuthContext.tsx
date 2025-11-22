"use client";

/**
 * Authentication context for React
 * Manages user login state and JWT tokens
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Load token from localStorage on mount and sync to cookie
    useEffect(() => {
        const savedToken = localStorage.getItem('apex_token');
        const savedUser = localStorage.getItem('apex_user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            // Ensure cookie is set for middleware
            Cookies.set('sb-access-token', savedToken, { expires: 7, secure: true, sameSite: 'Lax' });
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('apex_token', data.token);
                localStorage.setItem('apex_user', JSON.stringify(data.user));
                Cookies.set('sb-access-token', data.token, { expires: 7, secure: true, sameSite: 'Lax' });
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
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
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
                Cookies.set('sb-access-token', data.token, { expires: 7, secure: true, sameSite: 'Lax' });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('apex_token');
        localStorage.removeItem('apex_user');
        Cookies.remove('sb-access-token');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            signup,
            logout,
            isAuthenticated: !!token
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
