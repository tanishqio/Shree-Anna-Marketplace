"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * Wraps pages that require authentication.
 * Redirects to login if user is not authenticated.
 * Optionally checks for specific roles.
 */
export function ProtectedRoute({ 
  children, 
  requiredRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // If roles are required, check if user has at least one
    if (requiredRoles && requiredRoles.length > 0 && user) {
      const userRoles = user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        // User doesn't have required role - redirect to home
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, redirectTo, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children until authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If roles required and user doesn't have them, show loading while redirecting
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Access denied. Redirecting...</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * useRequireAuth Hook
 * Alternative to ProtectedRoute component for more control
 */
export function useRequireAuth(requiredRoles?: string[]) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoading, isAuthenticated, router]);

  const hasAccess = React.useMemo(() => {
    if (!isAuthenticated || !user) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    
    const userRoles = user.roles || [];
    return requiredRoles.some(role => userRoles.includes(role));
  }, [isAuthenticated, user, requiredRoles]);

  return {
    isLoading,
    isAuthenticated,
    hasAccess,
    user
  };
}
