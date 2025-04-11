import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const Login = () => {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useUser();
  const [, setLocation] = useLocation();

  // Check for error message in URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error === 'auth_required') {
      setErrorMessage('Authentication required to access this resource');
    } else if (error === 'invalid_token') {
      setErrorMessage('Your session has expired. Please log in again');
    }
  }, []);

  // This redirection is now handled in the Router component
  // We keep this for debugging only
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log("Already authenticated in Login component");
    }
  }, [isAuthenticated, isLoading]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    
    try {
      console.log(`Attempting to log in with username: ${username}`);
      const success = await login(username, password);
      console.log("Login result:", success);
      if (success) {
        // Set a flag in sessionStorage to indicate login just completed
        // This will trigger showing the splash screen
        sessionStorage.setItem('loginCompleted', 'true');
        console.log("Login successful, redirecting to dashboard");
        // Use setLocation instead of direct navigation to avoid refresh loop
        setLocation('/');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
              Sign in to access the AI-powered development platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                  className="border-[2px] border-black focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border-[2px] border-black focus:border-primary"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="remember" />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </div>
              
              <Button 
                type="submit"
                className="w-full font-bold border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2" size="sm" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          {/* CardFooter removed as requested */}
        </Card>
      </AnimatedContainer>
    </div>
  );
};

export default Login;