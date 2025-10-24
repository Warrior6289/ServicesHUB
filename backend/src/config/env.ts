import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Environment validation
const requiredEnvVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Configuration object
export const config = {
  app: {
    name: process.env.APP_NAME || 'Services Hub API',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    url: process.env.APP_URL || 'http://localhost:3001'
  },
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/services-hub',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://localhost:4173', 'http://localhost:5173']
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  },
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    },
    enabled: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    enabled: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    enabled: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY)
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    enabled: !!process.env.REDIS_URL
  },
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    enabled: !!process.env.SENTRY_DSN
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY || '',
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin123!'
  }
};

// Environment checks
export const isDevelopment = config.app.env === 'development';
export const isProduction = config.app.env === 'production';
export const isTest = config.app.env === 'test';

// Validation helpers
export const validateConfig = () => {
  const errors: string[] = [];

  // Validate port
  if (config.app.port < 1 || config.app.port > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }

  // Validate MongoDB URI
  if (!config.database.url.startsWith('mongodb://') && !config.database.url.startsWith('mongodb+srv://')) {
    errors.push('MONGODB_URI must be a valid MongoDB connection string');
  }

  // Validate JWT secrets
  if (config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  if (config.jwt.refreshSecret.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters long');
  }

  // Log warnings for disabled optional services
  if (isProduction) {
    if (!config.email.enabled) {
      console.warn('⚠️  Email service is disabled - email notifications will not work');
    }
    if (!config.cloudinary.enabled) {
      console.warn('⚠️  Cloudinary is disabled - image uploads will not work');
    }
    if (!config.stripe.enabled) {
      console.warn('⚠️  Stripe is disabled - payment processing will not work');
    }
    if (!config.redis.enabled) {
      console.warn('⚠️  Redis is disabled - caching will not work');
    }
    if (!config.sentry.enabled) {
      console.warn('⚠️  Sentry is disabled - error monitoring will not work');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Run validation
validateConfig();

export default config;