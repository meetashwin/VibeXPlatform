import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { User } from "@/lib/types";
import { AuthService } from "@/lib/authService";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface UserContextType {
  user: User | null;
  updateUser: (user: User) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  updateUser: () => {},
  login: async () => false,
  logout: () => {},
  isLoading: true,
  isAuthenticated: false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  // Replace state with ref to prevent constant re-renders
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define a reference to the logout function to avoid circular dependencies
  const logoutRef = useRef<(() => Promise<void>) | null>(null);
  
  // Handle user session timeout (5 minutes of inactivity)
  const handleUserActivity = useCallback(() => {
    if (userActivityTimeoutRef.current) {
      clearTimeout(userActivityTimeoutRef.current);
    }
    
    if (isAuthenticated) {
      // Reset the session timeout when there's user activity
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      
      // Set a new timeout for 5 minutes (300000 ms)
      const newTimeoutId = setTimeout(() => {
        toast({
          title: "Session Expired",
          description: "Your session has expired due to inactivity.",
          variant: "destructive",
        });
        
        // Call the logout function via ref
        if (logoutRef.current) {
          logoutRef.current();
        }
      }, 300000); // 5 minutes
      
      // Store timeout ID in ref instead of state to prevent re-renders
      sessionTimeoutRef.current = newTimeoutId;
    }
  }, [isAuthenticated, toast]);

  // Memoized logout function to expose to consumers
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear any existing session timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      
      // Clear timeout in ref as well
      if (userActivityTimeoutRef.current) {
        clearTimeout(userActivityTimeoutRef.current);
        userActivityTimeoutRef.current = null;
      }
      
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setLocation('/login');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "There was a problem logging out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setLocation, toast]);

  // Update the logout reference whenever the logout function changes
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);
  
  // Set up activity listeners for session timeout
  useEffect(() => {
    // Only set up listeners if user is authenticated
    if (isAuthenticated) {
      // Set initial session timeout
      handleUserActivity();
      
      // Set up event listeners for user activity
      const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
      
      const activityHandler = () => {
        handleUserActivity();
      };
      
      // Add event listeners
      activityEvents.forEach(event => {
        window.addEventListener(event, activityHandler);
      });
      
      return () => {
        // Clean up event listeners
        activityEvents.forEach(event => {
          window.removeEventListener(event, activityHandler);
        });
        
        // Clear any existing timeouts
        if (sessionTimeoutRef.current) {
          clearTimeout(sessionTimeoutRef.current);
          sessionTimeoutRef.current = null;
        }
        
        if (userActivityTimeoutRef.current) {
          clearTimeout(userActivityTimeoutRef.current);
          userActivityTimeoutRef.current = null;
        }
      };
    }
  }, [isAuthenticated, handleUserActivity]);

  useEffect(() => {
    // For debugging, logging whether we have a token
    console.log("Token at startup:", AuthService.getToken() ? "exists" : "does not exist");
    
    const checkAuthAndFetchUser = async () => {
      // Check if token exists and is valid
      const hasValidToken = await AuthService.verifyToken();
      console.log("Token verification:", hasValidToken ? "valid" : "invalid");
      
      if (hasValidToken) {
        // User is authenticated, fetch user data
        try {
          const res = await fetch("/api/users/me");
          if (res.ok) {
            const userData = await res.json();
            // Calculate initials for the user
            const enrichedUser = {
              ...userData,
              initials: getInitials(userData.name),
            };
            setUser(enrichedUser);
            setIsAuthenticated(true);
          } else {
            console.error("Error fetching user data", await res.text());
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setIsAuthenticated(false);
        }
      } else {
        // If token not valid, check for token in URL (for redirects from other applications)
        const urlParams = new URLSearchParams(window.location.search);
        const authToken = urlParams.get('authToken');
        
        if (authToken) {
          // Store the token and verify it
          localStorage.setItem(AuthService['TOKEN_KEY'], authToken);
          const isValid = await AuthService.verifyToken();
          
          if (isValid) {
            // Token is valid, fetch user data
            try {
              const res = await fetch("/api/users/me");
              if (res.ok) {
                const userData = await res.json();
                const enrichedUser = {
                  ...userData,
                  initials: getInitials(userData.name),
                };
                setUser(enrichedUser);
                setIsAuthenticated(true);
                
                // Remove token from URL to prevent security issues
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
              }
            } catch (error) {
              console.error("Error fetching user with token:", error);
              setIsAuthenticated(false);
            }
          } else {
            // Invalid token from URL
            toast({
              title: "Authentication Error",
              description: "The provided authentication token is invalid or expired.",
              variant: "destructive",
            });
            setIsAuthenticated(false);
          }
        } else {
          // No token available
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthAndFetchUser();
  }, [toast]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const loggedInUser = await AuthService.login(username, password);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${loggedInUser.name}!`,
      });
      
      // Initialize the session timeout after successful login
      handleUserActivity();
      
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Authentication failed. Please check your credentials.",
        variant: "destructive",
      });
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    const enrichedUser = {
      ...updatedUser,
      initials: getInitials(updatedUser.name),
    };
    setUser(enrichedUser);
    // Reset session timeout on user profile update
    handleUserActivity();
  };

  return (
    <UserContext.Provider value={{ user, updateUser, login, logout, isLoading, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};
