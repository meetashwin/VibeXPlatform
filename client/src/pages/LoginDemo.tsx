import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useUser } from '@/context/UserContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedContainer } from '@/components/ui/animated-container';

const LoginDemo = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useUser();
  const [, setLocation] = useLocation();

  const handleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    
    try {
      // Use hardcoded credentials (admin/admin123!)
      const success = await login('admin', 'admin123!');
      if (success) {
        // Set a flag in sessionStorage to indicate login just completed
        // This will trigger showing the splash screen
        sessionStorage.setItem('loginCompleted', 'true');
        setLocation('/');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <AnimatedContainer 
        variant="fadeInUp" 
        className="w-full max-w-md"
      >
        <Card className="border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">VibeX Platform</CardTitle>
            <CardDescription className="text-center">
              Welcome to the AI-powered development platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col items-center space-y-4">
              <p className="text-center text-lg">
                Click the button below to access the platform
              </p>
              
              <Button 
                onClick={handleSignIn} 
                className="w-full font-bold border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2" size="sm" />
                    Logging in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
};

export default LoginDemo;