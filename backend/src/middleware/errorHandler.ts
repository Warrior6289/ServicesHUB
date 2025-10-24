import { Request, Response, NextFunction } from 'express';
import { config, isDevelopment } from '../config/env';
import { IApiError } from '../types';

// Custom error class
export class AppError extends Error implements IApiError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle different types of errors
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'INVALID_ID');
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
  return new AppError(message, 400, 'DUPLICATE_FIELD');
};

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR', errors);
};

const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');
};

const handleMulterError = (err: any): AppError => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Maximum size is 5MB.', 400, 'FILE_TOO_LARGE');
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Maximum is 5 files.', 400, 'TOO_MANY_FILES');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected field name.', 400, 'UNEXPECTED_FIELD');
  }
  return new AppError('File upload error.', 400, 'UPLOAD_ERROR');
};

// Send error response in development
const sendErrorDev = (err: IApiError, res: Response): void => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
    code: err.code,
    details: err.details
  });
};

// Send error response in production
const sendErrorProd = (err: IApiError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details })
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Global error handling middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'MulterError') error = handleMulterError(err);

  // Send error response
  if (isDevelopment) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

// Validation error handler
export const handleValidationError = (errors: any[]): AppError => {
  const message = errors.map(err => err.msg).join('. ');
  return new AppError(message, 400, 'VALIDATION_ERROR', errors);
};

// Database connection error handler
export const handleDatabaseError = (err: any): AppError => {
  if (err.name === 'MongoNetworkError') {
    return new AppError('Database connection failed', 500, 'DATABASE_ERROR');
  }
  if (err.name === 'MongoTimeoutError') {
    return new AppError('Database operation timeout', 500, 'DATABASE_TIMEOUT');
  }
  return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
};

// File upload error handler
export const handleFileUploadError = (err: any): AppError => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File size exceeds limit', 400, 'FILE_TOO_LARGE');
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files uploaded', 400, 'TOO_MANY_FILES');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400, 'UNEXPECTED_FIELD');
  }
  return new AppError('File upload failed', 400, 'UPLOAD_ERROR');
};

// Rate limit error handler
export const handleRateLimitError = (): AppError => {
  return new AppError('Too many requests, please try again later', 429, 'RATE_LIMIT_EXCEEDED');
};

// Permission error handler
export const handlePermissionError = (message: string = 'Insufficient permissions'): AppError => {
  return new AppError(message, 403, 'PERMISSION_DENIED');
};

// Resource not found error handler
export const handleNotFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

// Conflict error handler
export const handleConflictError = (message: string): AppError => {
  return new AppError(message, 409, 'CONFLICT');
};

// Bad request error handler
export const handleBadRequestError = (message: string): AppError => {
  return new AppError(message, 400, 'BAD_REQUEST');
};

// Unauthorized error handler
export const handleUnauthorizedError = (message: string = 'Unauthorized'): AppError => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

// Forbidden error handler
export const handleForbiddenError = (message: string = 'Forbidden'): AppError => {
  return new AppError(message, 403, 'FORBIDDEN');
};

// Internal server error handler
export const handleInternalError = (message: string = 'Internal server error'): AppError => {
  return new AppError(message, 500, 'INTERNAL_ERROR');
};

// Service unavailable error handler
export const handleServiceUnavailableError = (message: string = 'Service temporarily unavailable'): AppError => {
  return new AppError(message, 503, 'SERVICE_UNAVAILABLE');
};

// Error logging utility
export const logError = (error: Error, req?: Request): void => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...(req && {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })
  };

  if (isDevelopment) {
    console.error('Error Details:', errorInfo);
  } else {
    // In production, send to logging service (e.g., Winston, Sentry)
    console.error('Production Error:', errorInfo);
  }
};

// Success response helper
export const sendSuccessResponse = (
  res: Response,
  data?: any,
  message: string = 'Success',
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data })
  });
};

// Pagination response helper
export const sendPaginatedResponse = (
  res: Response,
  data: any[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  },
  message: string = 'Success'
): void => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};
