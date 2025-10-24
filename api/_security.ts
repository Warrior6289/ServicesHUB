import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// CSRF Token Management
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Generate CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate CSRF token
export const validateCSRFToken = (token: string, sessionId: string): boolean => {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;
  
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
};

// Store CSRF token
export const storeCSRFToken = (sessionId: string, token: string, ttlMs: number = 3600000): void => {
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + ttlMs
  });
};

// CSRF Middleware
export const csrfProtection = (req: VercelRequest, res: VercelResponse): boolean => {
  // Skip CSRF for GET requests and safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || '')) {
    return true;
  }

  const sessionId = req.headers['x-session-id'] as string;
  const csrfToken = req.headers['x-csrf-token'] as string;

  if (!sessionId || !csrfToken) {
    res.status(403).json({
      success: false,
      message: 'CSRF token required',
      code: 'CSRF_TOKEN_REQUIRED'
    });
    return false;
  }

  if (!validateCSRFToken(csrfToken, sessionId)) {
    res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      code: 'INVALID_CSRF_TOKEN'
    });
    return false;
  }

  return true;
};

// Security Headers Middleware
export const securityHeaders = (res: VercelResponse): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HTTPS only)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none';"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
};

// Input Sanitization
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// Password Strength Validation
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Email Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone Number Validation
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

// SQL Injection Prevention (for MongoDB, prevent NoSQL injection)
export const sanitizeMongoQuery = (query: any): any => {
  if (typeof query === 'string') {
    // Remove potential MongoDB operators
    return query.replace(/[\$]/g, '');
  }
  
  if (typeof query === 'object' && query !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(query)) {
      // Prevent MongoDB operator injection
      if (key.startsWith('$')) {
        continue;
      }
      sanitized[key] = sanitizeMongoQuery(value);
    }
    return sanitized;
  }
  
  return query;
};

// Rate Limiting Storage (in-memory for serverless)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Advanced Rate Limiting
export const advancedRateLimit = (
  maxRequests: number = 100,
  windowMs: number = 900000,
  skipSuccessfulRequests: boolean = false
) => {
  return (req: VercelRequest, res: VercelResponse): boolean => {
    const clientId = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection?.remoteAddress || 
                    'unknown';
    
    const now = Date.now();
    const key = `rate_limit:${clientId}`;
    
    const clientData = rateLimitStore.get(key);
    
    if (!clientData || now > clientData.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (clientData.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        limit: maxRequests,
        remaining: 0,
        resetTime: clientData.resetTime
      });
      return false;
    }
    
    clientData.count++;
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientData.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000).toString());
    
    return true;
  };
};

// IP Whitelist/Blacklist
const blockedIPs = new Set<string>();
const allowedIPs = new Set<string>();

export const blockIP = (ip: string): void => {
  blockedIPs.add(ip);
};

export const allowIP = (ip: string): void => {
  allowedIPs.add(ip);
};

export const isIPBlocked = (ip: string): boolean => {
  if (blockedIPs.has(ip)) return true;
  if (allowedIPs.size > 0 && !allowedIPs.has(ip)) return true;
  return false;
};

// IP Filtering Middleware
export const ipFiltering = (req: VercelRequest, res: VercelResponse): boolean => {
  const clientIP = req.headers['x-forwarded-for'] || 
                  req.headers['x-real-ip'] || 
                  req.connection?.remoteAddress || 
                  'unknown';
  
  if (isIPBlocked(clientIP as string)) {
    res.status(403).json({
      success: false,
      message: 'Access denied',
      code: 'IP_BLOCKED'
    });
    return false;
  }
  
  return true;
};

// Request Size Limiting
export const requestSizeLimit = (maxSizeBytes: number = 10485760) => {
  return (req: VercelRequest, res: VercelResponse): boolean => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    
    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        success: false,
        message: 'Request too large',
        code: 'REQUEST_TOO_LARGE',
        maxSize: maxSizeBytes
      });
      return false;
    }
    
    return true;
  };
};

// Security Audit Logging
export const logSecurityEvent = (event: string, details: any, req: VercelRequest): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    method: req.method,
    url: req.url
  };
  
  console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
};

export default {
  generateCSRFToken,
  validateCSRFToken,
  storeCSRFToken,
  csrfProtection,
  securityHeaders,
  sanitizeInput,
  validatePasswordStrength,
  validateEmail,
  validatePhoneNumber,
  sanitizeMongoQuery,
  advancedRateLimit,
  blockIP,
  allowIP,
  isIPBlocked,
  ipFiltering,
  requestSizeLimit,
  logSecurityEvent
};
