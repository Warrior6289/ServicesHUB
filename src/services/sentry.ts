import * as Sentry from '@sentry/react';
import { config } from '../config/env';

// Initialize Sentry
export const initSentry = () => {
  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      tracesSampleRate: config.sentry.environment === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Integrations.BrowserTracing(),
        new Sentry.Integrations.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      beforeSend(event) {
        // Filter out non-critical errors in production
        if (config.sentry.environment === 'production') {
          const error = event.exception?.values?.[0];
          if (error?.type === 'ChunkLoadError' || error?.type === 'Loading chunk') {
            return null; // Don't send chunk load errors to Sentry
          }
        }
        return event;
      },
    });
  }
};

// Capture exceptions
export const captureException = (error: Error, context?: any) => {
  if (config.sentry.dsn) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional_info', context);
      }
      Sentry.captureException(error);
    });
  }
};

// Capture messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (config.sentry.dsn) {
    Sentry.captureMessage(message, level);
  }
};

// Set user context
export const setUserContext = (user: any) => {
  if (config.sentry.dsn) {
    Sentry.setUser({
      id: user._id,
      email: user.email,
      role: user.role,
    });
  }
};

// Add breadcrumb
export const addBreadcrumb = (message: string, category: string = 'custom', level: Sentry.SeverityLevel = 'info') => {
  if (config.sentry.dsn) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    });
  }
};

// Performance monitoring
export const startTransaction = (name: string, op: string = 'custom') => {
  if (config.sentry.dsn) {
    return Sentry.startTransaction({ name, op });
  }
  return null;
};

// Error boundary component
export const ErrorBoundary = Sentry.ErrorBoundary;

// Performance monitoring hook
export const useSentryPerformance = () => {
  const startTransaction = (name: string, op: string = 'custom') => {
    if (config.sentry.dsn) {
      return Sentry.startTransaction({ name, op });
    }
    return null;
  };

  const finishTransaction = (transaction: any) => {
    if (transaction) {
      transaction.finish();
    }
  };

  return { startTransaction, finishTransaction };
};

// API error tracking
export const trackApiError = (error: any, endpoint: string, method: string) => {
  if (config.sentry.dsn) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'api_error');
      scope.setContext('api_request', {
        endpoint,
        method,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      Sentry.captureException(error);
    });
  }
};

// User action tracking
export const trackUserAction = (action: string, details?: any) => {
  if (config.sentry.dsn) {
    Sentry.addBreadcrumb({
      message: `User action: ${action}`,
      category: 'user_action',
      level: 'info',
      data: details,
    });
  }
};

// Navigation tracking
export const trackNavigation = (from: string, to: string) => {
  if (config.sentry.dsn) {
    Sentry.addBreadcrumb({
      message: `Navigation: ${from} -> ${to}`,
      category: 'navigation',
      level: 'info',
    });
  }
};

// Form error tracking
export const trackFormError = (formName: string, field: string, error: string) => {
  if (config.sentry.dsn) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'form_error');
      scope.setContext('form_error', {
        form: formName,
        field,
        error,
      });
      Sentry.captureMessage(`Form error in ${formName}: ${field} - ${error}`, 'warning');
    });
  }
};

// File upload error tracking
export const trackFileUploadError = (fileName: string, fileSize: number, error: string) => {
  if (config.sentry.dsn) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'file_upload_error');
      scope.setContext('file_upload', {
        fileName,
        fileSize,
        error,
      });
      Sentry.captureException(new Error(`File upload failed: ${error}`));
    });
  }
};

// Network error tracking
export const trackNetworkError = (url: string, method: string, error: any) => {
  if (config.sentry.dsn) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'network_error');
      scope.setContext('network_request', {
        url,
        method,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      Sentry.captureException(error);
    });
  }
};

// Performance tracking
export const trackPerformance = (name: string, duration: number, details?: any) => {
  if (config.sentry.dsn) {
    Sentry.addBreadcrumb({
      message: `Performance: ${name}`,
      category: 'performance',
      level: 'info',
      data: {
        duration,
        ...details,
      },
    });
  }
};

// Memory usage tracking
export const trackMemoryUsage = () => {
  if (config.sentry.dsn && 'memory' in performance) {
    const memory = (performance as any).memory;
    if (memory) {
      Sentry.addBreadcrumb({
        message: 'Memory usage',
        category: 'performance',
        level: 'info',
        data: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        },
      });
    }
  }
};

// Initialize Sentry on app start
if (typeof window !== 'undefined') {
  initSentry();
}

export default {
  initSentry,
  captureException,
  captureMessage,
  setUserContext,
  addBreadcrumb,
  startTransaction,
  ErrorBoundary,
  useSentryPerformance,
  trackApiError,
  trackUserAction,
  trackNavigation,
  trackFormError,
  trackFileUploadError,
  trackNetworkError,
  trackPerformance,
  trackMemoryUsage,
};
