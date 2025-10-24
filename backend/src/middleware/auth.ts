import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { IAuthenticatedRequest } from '../types';

// Authentication middleware
export const authenticate = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
      return;
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    
    // Find the user
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user is active
    if (user.status !== 'active') {
      res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
      return;
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthenticate = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user && user.status === 'active') {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
    return;
  }

  next();
};

// Seller only middleware
export const sellerOnly = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Seller access required'
    });
    return;
  }

  next();
};

// Buyer only middleware
export const buyerOnly = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'buyer' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Buyer access required'
    });
    return;
  }

  next();
};

// Resource ownership middleware
export const checkResourceOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources'
      });
      return;
    }

    next();
  };
};

// Email verification middleware
export const requireEmailVerification = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (!req.user.emailVerified) {
    res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
    return;
  }

  next();
};

// Account status middleware
export const requireActiveAccount = (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.status === 'blocked') {
    res.status(403).json({
      success: false,
      message: 'Account has been blocked',
      code: 'ACCOUNT_BLOCKED'
    });
    return;
  }

  if (req.user.status === 'pending') {
    res.status(403).json({
      success: false,
      message: 'Account is pending approval',
      code: 'ACCOUNT_PENDING'
    });
    return;
  }

  next();
};

// API key authentication middleware (for admin operations)
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({
      success: false,
      message: 'API key is required'
    });
    return;
  }

  // Verify API key (implement based on your API key strategy)
  // For now, we'll use a simple check
  if (apiKey !== process.env.ADMIN_API_KEY) {
    res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
    return;
  }

  next();
};

// Rate limiting per user middleware
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: IAuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const userRequests = requests.get(userId);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
      return;
    }

    userRequests.count++;
    next();
  };
};

// Logout middleware (blacklist token)
export const logout = async (req: IAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user && req.token) {
      // Remove the token from user's refresh tokens
      await req.user.removeRefreshToken(req.token);
    }
    next();
  } catch (error) {
    next(error);
  }
};
