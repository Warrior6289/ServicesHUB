import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/env';
import { globalErrorHandler, notFound } from './middleware/errorHandler';
import { globalRateLimit } from './middleware/rateLimiter';
import { connectDatabase } from './config/database';
import { initSentry, sentryRequestHandler, sentryTracingMiddleware, sentryErrorHandler } from './services/sentryService';
import { specs, swaggerUiOptions } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { log, morganStream } from './services/loggerService';
import { connectRedis } from './services/redisService';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import sellerRoutes from './routes/sellerRoutes';
import serviceRequestRoutes from './routes/serviceRequestRoutes';
import adminRoutes from './routes/adminRoutes';

// Create Express app
const app = express();

// Initialize Sentry
initSentry();

// Sentry request handler must be the first middleware
app.use(sentryRequestHandler);

// Sentry tracing middleware
app.use(sentryTracingMiddleware);

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Logging middleware
if (config.app.env === 'development') {
  app.use(morgan('dev', { stream: morganStream }));
} else {
  app.use(morgan('combined', { stream: morganStream }));
}

// Rate limiting
app.use(globalRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.app.env,
    version: config.app.version
  });
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Services Hub API',
    version: config.app.version,
    environment: config.app.env,
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use(notFound);

// Sentry error handler must be before global error handler
app.use(sentryErrorHandler);

// Global error handler
app.use(globalErrorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejection
process.on('unhandledRejection', (err: Error) => {
  log.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Uncaught exception
process.on('uncaughtException', (err: Error) => {
  log.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Connect to Redis (optional)
    await connectRedis();
    
    // Start listening
    const server = app.listen(config.app.port, () => {
      log.info(`🚀 Server running on port ${config.app.port}`);
      log.info(`📱 Environment: ${config.app.env}`);
      log.info(`🌐 API URL: http://localhost:${config.app.port}`);
      log.info(`📚 Documentation: http://localhost:${config.app.port}/api/docs`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    log.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
