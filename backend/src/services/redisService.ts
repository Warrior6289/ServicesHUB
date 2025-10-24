import Redis from 'redis';
import { config } from '../config/env';
import { log } from './loggerService';

// Create Redis client only if enabled
let redisClient: Redis.RedisClientType | null = null;

if (config.redis.enabled) {
  redisClient = Redis.createClient({
    url: config.redis.url,
    password: config.redis.password
  });

  // Redis connection event handlers
  redisClient.on('connect', () => {
    log.info('✅ Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    log.error('❌ Redis connection error:', err);
  });

  redisClient.on('disconnect', () => {
    log.warn('⚠️ Redis disconnected');
  });

  redisClient.on('reconnecting', () => {
    log.info('🔄 Redis reconnecting...');
  });
} else {
  log.info('Redis disabled - no URL provided');
}

// Connect to Redis
export const connectRedis = async (): Promise<void> => {
  if (!config.redis.enabled || !redisClient) {
    log.info('Redis disabled - skipping connection');
    return;
  }

  try {
    await redisClient.connect();
    log.info('📊 Connected to Redis');
  } catch (error) {
    log.error('Failed to connect to Redis:', error);
    // Don't exit process, continue without Redis
  }
};

// Cache service
export class CacheService {
  // Set cache with TTL
  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (!redisClient) return;
    
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttlSeconds, serializedValue);
    } catch (error) {
      log.error('Redis set error:', error);
    }
  }

  // Get cache
  static async get(key: string): Promise<any> {
    if (!redisClient) return null;
    
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      log.error('Redis get error:', error);
      return null;
    }
  }

  // Delete cache
  static async del(key: string): Promise<void> {
    if (!redisClient) return;
    
    try {
      await redisClient.del(key);
    } catch (error) {
      log.error('Redis delete error:', error);
    }
  }

  // Delete multiple keys
  static async delMultiple(keys: string[]): Promise<void> {
    if (!redisClient) return;
    
    try {
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      log.error('Redis delete multiple error:', error);
    }
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    if (!redisClient) return false;
    
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      log.error('Redis exists error:', error);
      return false;
    }
  }

  // Set cache with expiration
  static async setWithExpiration(key: string, value: any, expirationDate: Date): Promise<void> {
    if (!redisClient) return;
    
    try {
      const serializedValue = JSON.stringify(value);
      const ttlSeconds = Math.floor((expirationDate.getTime() - Date.now()) / 1000);
      if (ttlSeconds > 0) {
        await redisClient.setEx(key, ttlSeconds, serializedValue);
      }
    } catch (error) {
      log.error('Redis set with expiration error:', error);
    }
  }

  // Increment counter
  static async increment(key: string, by: number = 1): Promise<number> {
    if (!redisClient) return 0;
    
    try {
      return await redisClient.incrBy(key, by);
    } catch (error) {
      log.error('Redis increment error:', error);
      return 0;
    }
  }

  // Decrement counter
  static async decrement(key: string, by: number = 1): Promise<number> {
    if (!redisClient) return 0;
    
    try {
      return await redisClient.decrBy(key, by);
    } catch (error) {
      log.error('Redis decrement error:', error);
      return 0;
    }
  }

  // Get TTL
  static async getTTL(key: string): Promise<number> {
    if (!redisClient) return -1;
    
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      log.error('Redis TTL error:', error);
      return -1;
    }
  }

  // Flush all cache
  static async flushAll(): Promise<void> {
    if (!redisClient) return;
    
    try {
      await redisClient.flushAll();
    } catch (error) {
      log.error('Redis flush all error:', error);
    }
  }

  // Get all keys matching pattern
  static async getKeys(pattern: string): Promise<string[]> {
    if (!redisClient) return [];
    
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      log.error('Redis keys error:', error);
      return [];
    }
  }
}

// Cache middleware for Express routes
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: any, res: any, next: any) => {
    const key = `cache:${req.method}:${req.originalUrl}`;
    
    try {
      const cachedData = await CacheService.get(key);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      // Store original res.json
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data: any) {
        CacheService.set(key, data, ttlSeconds);
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Session storage for Redis
export const sessionStorage = {
  async set(sessionId: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    await CacheService.set(`session:${sessionId}`, data, ttlSeconds);
  },

  async get(sessionId: string): Promise<any> {
    return await CacheService.get(`session:${sessionId}`);
  },

  async delete(sessionId: string): Promise<void> {
    await CacheService.del(`session:${sessionId}`);
  }
};

// Rate limiting with Redis
export const rateLimitWithRedis = (maxRequests: number, windowMs: number) => {
  return async (req: any, res: any, next: any) => {
    const key = `rate_limit:${req.ip}`;
    
    try {
      const current = await CacheService.increment(key);
      
      if (current === 1) {
        await CacheService.setWithExpiration(key, 1, new Date(Date.now() + windowMs));
      }
      
      if (current > maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
      
      next();
    } catch (error) {
      next();
    }
  };
};

// Disconnect Redis
export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient) return;
  
  try {
    await redisClient.quit();
    log.info('📊 Redis disconnected');
  } catch (error) {
    log.error('Error disconnecting from Redis:', error);
  }
};

export default {
  connectRedis,
  disconnectRedis,
  CacheService,
  cacheMiddleware,
  sessionStorage,
  rateLimitWithRedis
};
