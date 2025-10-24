import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../backend/src/config/database';
import { log } from '../backend/src/services/loggerService';

// Global connection cache for serverless functions
let cachedConnection: any = null;

// Database connection for serverless functions
export const connectToDatabase = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    cachedConnection = await connectDatabase();
    log.info('Database connected for serverless function');
    return cachedConnection;
  } catch (error) {
    log.error('Failed to connect to database in serverless function:', error);
    throw error;
  }
};

// Middleware for serverless functions
export const withDatabase = (handler: (req: VercelRequest, res: VercelResponse, db: any) => Promise<void>) => {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      const db = await connectToDatabase();
      await handler(req, res, db);
    } catch (error) {
      log.error('Serverless function error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// CORS headers for serverless functions
export const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Max-Age', '86400');
};

// Handle OPTIONS requests
export const handleOptions = (res: VercelResponse) => {
  setCorsHeaders(res);
  res.status(200).end();
};

// Parse request body for serverless functions
export const parseBody = (req: VercelRequest): any => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return req.query;
  }
  
  try {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (error) {
    log.error('Failed to parse request body:', error);
    return {};
  }
};

// Extract user from JWT token (placeholder - implement based on your auth strategy)
export const extractUser = (req: VercelRequest): any => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  // TODO: Implement JWT verification
  // For now, return null
  return null;
};

// Rate limiting for serverless functions (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 900000) => {
  return (req: VercelRequest, res: VercelResponse): boolean => {
    const clientId = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (clientData.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
      return false;
    }
    
    clientData.count++;
    return true;
  };
};

export default {
  connectToDatabase,
  withDatabase,
  setCorsHeaders,
  handleOptions,
  parseBody,
  extractUser,
  rateLimit
};
