import { User } from './types';

// Type for login response
interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Type for token verification response
interface VerifyResponse {
  valid: boolean;
  user?: {
    userId: number;
    username: string;
    email: string;
  };
}

/**
 * Class to handle authentication related operations
 */
export class AuthService {
  // Token storage key
  private static TOKEN_KEY = 'vibeX_auth_token';
  
  /**
   * Attempts to login a user with provided credentials
   */
  static async login(username: string, password: string): Promise<User> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed. Server returned: ' + response.status);
      }
      
      const data = await response.json() as LoginResponse;
      
      // Store token in localStorage for persistence across page refreshes
      localStorage.setItem(this.TOKEN_KEY, data.token);
      
      // Return user object
      return {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        initials: this.getInitials(data.user.name),
        preferences: {
          darkMode: false,
          notifications: true,
        },
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Authentication failed. Please check your credentials and try again.');
    }
  }
  
  /**
   * Logs out the current user
   */
  static async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    }
    
    // Remove token regardless of API success/failure
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  /**
   * Verifies if the stored token is still valid
   */
  static async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json() as VerifyResponse;
      return data.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }
  
  /**
   * Retrieves the stored authentication token
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  /**
   * Checks if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    // Check if token exists
    return !!this.getToken();
  }
  
  /**
   * Get initials from a name
   */
  private static getInitials(name: string): string {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}

/**
 * Hook for handling authentication in components
 * This will be expanded in the UserContext
 */
export function useAuth() {
  return {
    login: AuthService.login,
    logout: AuthService.logout,
    isAuthenticated: AuthService.isAuthenticated,
    getToken: AuthService.getToken,
  };
}