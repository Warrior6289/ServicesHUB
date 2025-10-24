import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/env';
import { handleRateLimitError } from './errorHandler';

// Custom rate limit key generator
const keyGenerator = (req: Request): string => {
  // Use IP address as primary key
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // If user is authenticated, use user ID for more granular limiting
  if (req.user) {
    return `user:${req.user._id}`;
  }
  
  return `ip:${ip}`;
};

// Custom rate limit handler
const rateLimitHandler = (req: Request, res: Response): void => {
  const error = handleRateLimitError();
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  });
};

// Global rate limiter
export const globalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Strict rate limiter for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

// Moderate rate limiter for sensitive operations
export const sensitiveRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many sensitive operations, please try again later.',
    code: 'SENSITIVE_RATE_LIMIT_EXCEEDED'
  }
});

// File upload rate limiter
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  }
});

// Password reset rate limiter
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
  }
});

// Email verification rate limiter
export const emailVerificationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 verification attempts per hour
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many email verification attempts, please try again later.',
    code: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED'
  }
});

// API key rate limiter (for admin operations)
export const apiKeyRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req: Request) => {
    const apiKey = req.headers['x-api-key'] as string;
    return `api:${apiKey || 'unknown'}`;
  },
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'API rate limit exceeded, please try again later.',
    code: 'API_RATE_LIMIT_EXCEEDED'
  }
});

// Search rate limiter
export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many search requests, please try again later.',
    code: 'SEARCH_RATE_LIMIT_EXCEEDED'
  }
});

// Service request creation rate limiter
export const serviceRequestRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 service requests per hour
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many service requests created, please try again later.',
    code: 'SERVICE_REQUEST_RATE_LIMIT_EXCEEDED'
  }
});

// Price boost rate limiter
export const priceBoostRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 price boosts per hour
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many price boost attempts, please try again later.',
    code: 'PRICE_BOOST_RATE_LIMIT_EXCEEDED'
  }
});

// Contact form rate limiter
export const contactFormRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 contact form submissions per hour
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again later.',
    code: 'CONTACT_FORM_RATE_LIMIT_EXCEEDED'
  }
});

// Dynamic rate limiter based on user role
export const dynamicRateLimit = (baseLimit: number) => {
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: (req: Request) => {
      // Admin users get higher limits
      if (req.user && req.user.role === 'admin') {
        return baseLimit * 5;
      }
      
      // Seller users get moderate limits
      if (req.user && req.user.role === 'seller') {
        return baseLimit * 2;
      }
      
      // Regular users get base limit
      return baseLimit;
    },
    keyGenerator,
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false
  });
};

// IP-based rate limiter (for blocking suspicious IPs)
export const ipBasedRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour per IP
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'IP rate limit exceeded, please try again later.',
    code: 'IP_RATE_LIMIT_EXCEEDED'
  }
});

// Custom rate limiter for specific endpoints
export const createCustomRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator,
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: message || 'Rate limit exceeded, please try again later.',
      code: 'CUSTOM_RATE_LIMIT_EXCEEDED'
    }
  });
};

// Rate limit bypass for trusted IPs
export const bypassRateLimit = (req: Request): boolean => {
  const trustedIPs = [
    '127.0.0.1',
    '::1',
    'localhost'
  ];
  
  const clientIP = req.ip || req.connection.remoteAddress;
  return trustedIPs.includes(clientIP || '');
};

// Rate limit status middleware
export const rateLimitStatus = (req: Request, res: Response, next: any): void => {
  // This would typically be implemented with a Redis store
  // For now, we'll just pass through
  next();
};

export default {
  globalRateLimit,
  authRateLimit,
  sensitiveRateLimit,
  uploadRateLimit,
  passwordResetRateLimit,
  emailVerificationRateLimit,
  apiKeyRateLimit,
  searchRateLimit,
  serviceRequestRateLimit,
  priceBoostRateLimit,
  contactFormRateLimit,
  dynamicRateLimit,
  ipBasedRateLimit,
  createCustomRateLimit
};
