import * as Sentry from '@sentry/node';
import { config } from '../config/env';

// Initialize Sentry
export const initSentry = () => {
  if (config.sentry.enabled && config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      tracesSampleRate: config.app.env === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: undefined }),
        new Sentry.Integrations.Mongo({ useMongoose: true }),
      ],
      beforeSend(event) {
        // Filter out non-critical errors in production
        if (config.app.env === 'production') {
          const error = event.exception?.values?.[0];
          if (error?.type === 'ValidationError' || error?.type === 'CastError') {
            return null; // Don't send validation errors to Sentry
          }
        }
        return event;
      },
    });
    console.log('Sentry initialized successfully');
  } else {
    console.log('Sentry disabled - no DSN provided');
  }
};

// Sentry request handler middleware
export const sentryRequestHandler = config.sentry.enabled ? Sentry.requestHandler() : (req: any, res: any, next: any) => next();

// Sentry tracing middleware
export const sentryTracingMiddleware = config.sentry.enabled ? Sentry.tracingMiddleware() : (req: any, res: any, next: any) => next();

// Sentry error handler middleware
export const sentryErrorHandler = config.sentry.enabled ? Sentry.errorHandler() : (err: any, req: any, res: any, next: any) => next(err);

// Capture exceptions
export const captureException = (error: Error, context?: any) => {
  if (config.sentry.enabled) {
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
  if (config.sentry.enabled) {
    Sentry.captureMessage(message, level);
  }
};

// Set user context
export const setUserContext = (user: any) => {
  if (config.sentry.enabled) {
    Sentry.setUser({
      id: user._id,
      email: user.email,
      role: user.role,
    });
  }
};

// Add breadcrumb
export const addBreadcrumb = (message: string, category: string = 'custom', level: Sentry.SeverityLevel = 'info') => {
  if (config.sentry.enabled) {
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
  if (config.sentry.enabled) {
    return Sentry.startTransaction({ name, op });
  }
  return null;
};

// Close Sentry
export const closeSentry = async () => {
  if (config.sentry.enabled) {
    await Sentry.close(2000);
  }
};

export default {
  initSentry,
  sentryRequestHandler,
  sentryTracingMiddleware,
  sentryErrorHandler,
  captureException,
  captureMessage,
  setUserContext,
  addBreadcrumb,
  startTransaction,
  closeSentry
};
