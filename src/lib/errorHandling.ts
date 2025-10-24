import React from 'react';
import axios from 'axios';
import { env } from './env';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ApiErrorHandler {
  static handle(error: any): ApiError {
    // Network errors
    if (!error.response) {
      return {
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
        status: 0
      };
    }

    const { status, data } = error.response;
    
    // Handle different HTTP status codes
    switch (status) {
      case 400:
        return {
          message: data?.message || 'Invalid request. Please check your input.',
          code: 'BAD_REQUEST',
          status: 400,
          details: data
        };
      
      case 401:
        return {
          message: 'You are not authorized. Please log in again.',
          code: 'UNAUTHORIZED',
          status: 401
        };
      
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN',
          status: 403
        };
      
      case 404:
        return {
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND',
          status: 404
        };
      
      case 409:
        return {
          message: data?.message || 'Conflict with existing data.',
          code: 'CONFLICT',
          status: 409,
          details: data
        };
      
      case 422:
        return {
          message: data?.message || 'Validation failed. Please check your input.',
          code: 'VALIDATION_ERROR',
          status: 422,
          details: data
        };
      
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          code: 'RATE_LIMITED',
          status: 429
        };
      
      case 500:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          status: 500
        };
      
      case 503:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
          status: 503
        };
      
      default:
        return {
          message: data?.message || 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR',
          status,
          details: data
        };
    }
  }

  static getUserFriendlyMessage(error: ApiError): string {
    // Return user-friendly messages based on error type
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection.';
      
      case 'UNAUTHORIZED':
        return 'Your session has expired. Please log in again.';
      
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.';
      
      case 'NOT_FOUND':
        return 'The requested item could not be found.';
      
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      
      case 'RATE_LIMITED':
        return 'Please wait a moment before trying again.';
      
      case 'SERVER_ERROR':
        return 'Something went wrong on our end. Please try again later.';
      
      case 'SERVICE_UNAVAILABLE':
        return 'The service is temporarily unavailable. Please try again later.';
      
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  static shouldRetry(error: ApiError): boolean {
    // Determine if the request should be retried
    const retryableCodes = ['NETWORK_ERROR', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE', 'RATE_LIMITED'];
    return retryableCodes.includes(error.code || '');
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, attempt), 16000);
  }
}

// Toast notification system for errors
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class NotificationManager {
  private static notifications: ToastNotification[] = [];
  private static listeners: ((notifications: ToastNotification[]) => void)[] = [];

  static subscribe(listener: (notifications: ToastNotification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static addNotification(notification: Omit<ToastNotification, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(id);
    }, newNotification.duration);

    return id;
  }

  static removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  static clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Convenience methods
  static success(title: string, message: string, duration?: number) {
    return this.addNotification({ type: 'success', title, message, duration });
  }

  static error(title: string, message: string, duration?: number) {
    return this.addNotification({ type: 'error', title, message, duration });
  }

  static warning(title: string, message: string, duration?: number) {
    return this.addNotification({ type: 'warning', title, message, duration });
  }

  static info(title: string, message: string, duration?: number) {
    return this.addNotification({ type: 'info', title, message, duration });
  }
}

// Hook for using notifications
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<ToastNotification[]>([]);

  React.useEffect(() => {
    const unsubscribe = NotificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  return {
    notifications,
    addNotification: NotificationManager.addNotification,
    removeNotification: NotificationManager.removeNotification,
    clearAll: NotificationManager.clearAll,
    success: NotificationManager.success,
    error: NotificationManager.error,
    warning: NotificationManager.warning,
    info: NotificationManager.info
  };
}

// Enhanced API client with error handling
export function createApiClient() {
  const client = axios.create({
    baseURL: env.API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor with error handling
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const apiError = ApiErrorHandler.handle(error);
      
      // Log error in development
      if (env.NODE_ENV === 'development') {
        console.error('API Error:', apiError);
      }

      // Show user-friendly notification
      const userMessage = ApiErrorHandler.getUserFriendlyMessage(apiError);
      NotificationManager.error('Request Failed', userMessage);

      // Handle specific error cases
      if (apiError.code === 'UNAUTHORIZED') {
        // Clear auth token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
      }

      return Promise.reject(apiError);
    }
  );

  return client;
}

// Retry mechanism for failed requests
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const apiError = ApiErrorHandler.handle(error);
      
      if (!ApiErrorHandler.shouldRetry(apiError) || attempt === maxAttempts - 1) {
        throw apiError;
      }

      const delay = ApiErrorHandler.getRetryDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
