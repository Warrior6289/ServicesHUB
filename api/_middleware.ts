import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, parseBody, extractUser, rateLimit } from './_utils/db';
import { 
  securityHeaders, 
  sanitizeInput, 
  validatePasswordStrength, 
  validateEmail, 
  validatePhoneNumber,
  advancedRateLimit,
  requestSizeLimit,
  logSecurityEvent
} from './_security';

// Security middleware wrapper
export const withSecurity = (handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) => {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Apply security headers
    securityHeaders(res);
    
    // Apply request size limiting
    if (!requestSizeLimit()(req, res)) return;
    
    // Apply rate limiting
    if (!advancedRateLimit()(req, res)) return;
    
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    
    try {
      await handler(req, res);
    } catch (error) {
      logSecurityEvent('ERROR', { error: error.message }, req);
      throw error;
    }
  };
};

// Middleware for authentication
export const requireAuth = (req: VercelRequest, res: VercelResponse): boolean => {
  const user = extractUser(req);
  if (!user) {
    logSecurityEvent('AUTH_FAILED', { reason: 'No user token' }, req);
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
    return false;
  }
  return true;
};

// Middleware for role-based access
export const requireRole = (allowedRoles: string[]) => {
  return (req: VercelRequest, res: VercelResponse): boolean => {
    const user = extractUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
      return false;
    }
    
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
      return false;
    }
    
    return true;
  };
};

// Middleware for admin access
export const requireAdmin = (req: VercelRequest, res: VercelResponse): boolean => {
  return requireRole(['admin'])(req, res);
};

// Middleware for seller access
export const requireSeller = (req: VercelRequest, res: VercelResponse): boolean => {
  return requireRole(['seller', 'admin'])(req, res);
};

// Enhanced validation middleware
export const validateBody = (schema: any) => {
  return (req: VercelRequest, res: VercelResponse): boolean => {
    const body = parseBody(req);
    
    try {
      const { error } = schema.validate(body);
      if (error) {
        logSecurityEvent('VALIDATION_ERROR', { errors: error.details }, req);
        res.status(400).json({
          success: false,
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.details
        });
        return false;
      }
      return true;
    } catch (err) {
      logSecurityEvent('VALIDATION_EXCEPTION', { error: err.message }, req);
      res.status(400).json({
        success: false,
        message: 'Invalid request body',
        code: 'INVALID_BODY'
      });
      return false;
    }
  };
};

// User registration validation
export const validateRegistration = (req: VercelRequest, res: VercelResponse): boolean => {
  const { name, email, password, phone } = parseBody(req);
  const errors: string[] = [];
  
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!email || !validateEmail(email)) {
    errors.push('Valid email address is required');
  }
  
  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }
  }
  
  if (phone && !validatePhoneNumber(phone)) {
    errors.push('Invalid phone number format');
  }
  
  if (errors.length > 0) {
    logSecurityEvent('REGISTRATION_VALIDATION_FAILED', { errors }, req);
    res.status(400).json({
      success: false,
      message: 'Registration validation failed',
      code: 'VALIDATION_ERROR',
      details: errors
    });
    return false;
  }
  
  return true;
};

// Error handling middleware
export const handleError = (error: any, res: VercelResponse) => {
  console.error('Serverless function error:', error);
  
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.details
    });
  } else if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      code: 'INVALID_ID'
    });
  } else if (error.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      code: 'DUPLICATE_ENTRY'
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Success response helper
export const sendSuccess = (res: VercelResponse, data: any, message: string = 'Success', statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Pagination helper
export const paginate = (data: any[], page: number = 1, limit: number = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      pages: Math.ceil(data.length / limit),
      hasNext: endIndex < data.length,
      hasPrev: page > 1
    }
  };
};

// Combine multiple middleware functions
export const combineMiddleware = (...middlewares: Array<(req: VercelRequest, res: VercelResponse) => boolean>) => {
  return (req: VercelRequest, res: VercelResponse): boolean => {
    for (const middleware of middlewares) {
      if (!middleware(req, res)) {
        return false;
      }
    }
    return true;
  };
};

export default {
  requireAuth,
  requireRole,
  requireAdmin,
  requireSeller,
  validateBody,
  handleError,
  sendSuccess,
  paginate,
  combineMiddleware,
  setCorsHeaders,
  handleOptions,
  parseBody,
  extractUser,
  rateLimit
};
