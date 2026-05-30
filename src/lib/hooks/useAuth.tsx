/**
 * Shree Anna - Authentication Hook
 * Manages user authentication state and provides auth methods
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import {
  authApi,
  userApi,
  setAccessToken,
  getAccessToken,
  User,
  isDevPhone,
  isDevOtp,
  setDevUserRole,
  getDevUserRole,
  getDevPhoneRole,
  DEV_PHONES,
  DEV_PHONE,
  DEV_OTP
} from '../api';

// Re-export developer utilities for easy access
export { isDevPhone, isDevOtp, setDevUserRole, getDevUserRole, getDevPhoneRole, DEV_PHONES, DEV_PHONE, DEV_OTP };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  requestOtp: (phone: string, language?: string, isRegistration?: boolean) => Promise<{ success: boolean; devOtp?: string; userExists?: boolean; message?: string }>;
  verifyOtp: (phone: string, otp: string, isRegistration?: boolean) => Promise<{ success: boolean; user?: User }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch (err) {
          // Token expired or invalid
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const requestOtp = useCallback(async (phone: string, language: string = 'en', isRegistration: boolean = false) => {
    setError(null);
    try {
      const response = await authApi.requestOtp(phone, language, isRegistration);
      if (!response.success) {
        setError(response.message || 'Failed to send OTP');
      }
      return {
        success: response.success,
        devOtp: response.dev_otp,
        userExists: response.user_exists,
        message: response.message
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string, isRegistration: boolean = false) => {
    setError(null);
    try {
      const response = await authApi.verifyOtp(phone, otp, isRegistration);
      if (response.token) {
        setAccessToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid OTP';
      setError(message);
      return { success: false };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await userApi.getProfile();
      setUser(userData);
    } catch {
      // Ignore refresh errors
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        requestOtp,
        verifyOtp,
        logout,
        refreshUser,
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
