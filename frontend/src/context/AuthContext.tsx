import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { api } from '../lib/apiClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; username: string; password: string; name?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize CSRF token and verify existing session
  const refreshUser = useCallback(async () => {
    try {
      // 1. Fetch CSRF token
      const csrfRes = await api.get<{ csrfToken: string }>('/auth/csrf-token');
      if (csrfRes.success && csrfRes.data?.csrfToken) {
        api.setCsrfToken(csrfRes.data.csrfToken);
      }

      // 2. Fetch current authenticated user if cookie is present
      const meRes = await api.get<{ user: User }>('/auth/me');
      if (meRes.success && meRes.data?.user) {
        setUser(meRes.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (emailOrUsername: string, password: string) => {
    const res = await api.post<{ user: User; csrfToken: string }>('/auth/login', {
      emailOrUsername,
      password,
    });

    if (res.success && res.data?.user) {
      setUser(res.data.user);
      if (res.data.csrfToken) {
        api.setCsrfToken(res.data.csrfToken);
      }
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || 'Login failed. Please check your credentials.',
    };
  };

  const register = async (data: { email: string; username: string; password: string; name?: string }) => {
    const res = await api.post<{ user: User; csrfToken: string }>('/auth/register', data);

    if (res.success && res.data?.user) {
      setUser(res.data.user);
      if (res.data.csrfToken) {
        api.setCsrfToken(res.data.csrfToken);
      }
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || 'Registration failed. Please try again.',
    };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      api.setCsrfToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
