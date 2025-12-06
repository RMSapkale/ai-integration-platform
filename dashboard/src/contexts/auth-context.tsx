"use client"

/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getToken, removeToken } from '@/lib/api-client';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    status: string;
    company_id?: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAdmin: () => boolean;
    isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = getToken();
        if (token) {
            // Decode JWT to get user info (simple base64 decode)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // In a real app, you'd fetch the full user profile from the backend
                // For now, we'll store minimal info from the token
                setUser({
                    id: 0, // Will be populated from backend
                    email: payload.sub,
                    name: '',
                    role: '',
                    status: 'active',
                });
            } catch (error) {
                console.error('Invalid token:', error);
                removeToken();
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await authAPI.login(email, password);

            // Decode token to get user info
            const token = getToken();
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: 0,
                    email: payload.sub,
                    name: '',
                    role: '',
                    status: 'active',
                });
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    const isAdmin = () => {
        return user?.role === 'admin' || user?.role === 'super_admin';
    };

    const isSuperAdmin = () => {
        return user?.role === 'super_admin';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                isAdmin,
                isSuperAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
