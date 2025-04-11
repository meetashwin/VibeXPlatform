import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUser } from '@/context/UserContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Component to protect routes requiring authentication
 * Redirects to login page if not authenticated
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useUser();
  const [, setLocation] = useLocation();

  // For debugging
  console.log('AuthGuard:', { isAuthenticated, isLoading });

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated and not loading, redirect (handled in useEffect)
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default AuthGuard;