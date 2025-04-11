import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cookie from 'cookie-parser';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'vibe-x-development-secret-key';

export interface DecodedToken {
  userId: number;
  username: string;
  email: string;
  // Add any other fields you expect in your token
  iat?: number;
  exp?: number;
}

/**
 * Verifies a JWT token and returns the decoded data
 */
export function verifyAuthToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Middleware to protect routes requiring authentication
 * Checks for token in query params (for initial redirect) or cookies (for subsequent requests)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check for token in query params (for initial redirect)
  const queryToken = req.query.authToken as string | undefined;
  
  // Check for token in cookies (for subsequent requests)
  const cookieToken = req.cookies?.authToken;
  
  // Use query token or cookie token
  const token = queryToken || cookieToken;
  
  if (!token) {
    console.log('No auth token found, redirecting to login');
    // For API routes, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // For other routes, redirect to login
    return res.redirect('/login?error=auth_required');
  }
  
  // Verify token
  const decoded = verifyAuthToken(token);
  
  if (!decoded) {
    console.log('Invalid auth token, redirecting to login');
    // For API routes, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    // For other routes, redirect to login
    return res.redirect('/login?error=invalid_token');
  }
  
  // Store user info for the request
  req.user = decoded;
  
  // If token was in query params, set as cookie for future requests
  if (queryToken && !cookieToken) {
    res.cookie('authToken', queryToken, { 
      httpOnly: true, 
      maxAge: 3600000, // 1 hour
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }
  
  next();
}

/**
 * Middleware for optional authentication
 * Will not block the request if no token is present, but will set req.user if a valid token is found
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const queryToken = req.query.authToken as string | undefined;
  const cookieToken = req.cookies?.authToken;
  const token = queryToken || cookieToken;
  
  if (token) {
    const decoded = verifyAuthToken(token);
    if (decoded) {
      req.user = decoded;
      
      // Set cookie if token was in query params
      if (queryToken && !cookieToken) {
        res.cookie('authToken', queryToken, { 
          httpOnly: true, 
          maxAge: 3600000, // 1 hour
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
      }
    }
  }
  
  next();
}