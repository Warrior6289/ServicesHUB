// Environment configuration and validation
interface EnvironmentConfig {
  API_BASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  APP_VERSION: string;
  SENTRY_DSN?: string;
  ANALYTICS_ID?: string;
}

function validateEnvironment(): EnvironmentConfig {
  const requiredEnvVars = {
    NODE_ENV: import.meta.env.NODE_ENV,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
  };

  // Validate required environment variables
  if (!requiredEnvVars.NODE_ENV) {
    throw new Error('NODE_ENV is required');
  }

  const config: EnvironmentConfig = {
    API_BASE_URL: '/api', // Use relative path for Vercel serverless functions
    NODE_ENV: requiredEnvVars.NODE_ENV as EnvironmentConfig['NODE_ENV'],
    APP_VERSION: requiredEnvVars.VITE_APP_VERSION || '1.0.0',
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
  };

  // Log configuration in development
  if (config.NODE_ENV === 'development') {
    console.log('Environment Configuration:', {
      API_BASE_URL: config.API_BASE_URL,
      NODE_ENV: config.NODE_ENV,
      APP_VERSION: config.APP_VERSION,
      SENTRY_ENABLED: !!config.SENTRY_DSN,
      ANALYTICS_ENABLED: !!config.ANALYTICS_ID,
    });
  }

  return config;
}

export const env = validateEnvironment();

// Environment-specific configurations
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Feature flags based on environment
export const features = {
  enableAnalytics: isProduction && !!env.ANALYTICS_ID,
  enableErrorReporting: isProduction && !!env.SENTRY_DSN,
  enableMockData: isDevelopment || isTest,
  enableDebugLogs: isDevelopment,
} as const;
