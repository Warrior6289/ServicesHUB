import mongoose from 'mongoose';
import { config } from './env';

// MongoDB connection options
const mongoOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  retryWrites: true,
  retryReads: true,
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Connect to MongoDB
export const connectDatabase = async (): Promise<void> => {
  try {
    if (!config.database.url) {
      throw new Error('MongoDB connection URL is not defined');
    }

    await mongoose.connect(config.database.url, mongoOptions);
    
    console.log(`📊 Connected to MongoDB: ${config.database.url.split('@')[1] || 'local'}`);
    
    // Set mongoose to use strict mode
    mongoose.set('strictQuery', true);
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Disconnect from MongoDB
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('📊 MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

// Get connection status
export const getConnectionStatus = (): string => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
};

// Check if database is connected
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Get database stats
export const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db?.stats();
    return {
      connected: isDatabaseConnected(),
      status: getConnectionStatus(),
      collections: stats?.collections || 0,
      dataSize: stats?.dataSize || 0,
      indexSize: stats?.indexSize || 0,
      storageSize: stats?.storageSize || 0
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      connected: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Create indexes for better performance
export const createIndexes = async (): Promise<void> => {
  try {
    // User indexes
    await mongoose.connection.db?.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db?.collection('users').createIndex({ role: 1 });
    await mongoose.connection.db?.collection('users').createIndex({ status: 1 });
    await mongoose.connection.db?.collection('users').createIndex({ createdAt: -1 });

    // Seller profile indexes
    await mongoose.connection.db?.collection('sellerprofiles').createIndex({ userId: 1 }, { unique: true });
    await mongoose.connection.db?.collection('sellerprofiles').createIndex({ 'location.coordinates': '2dsphere' });
    await mongoose.connection.db?.collection('sellerprofiles').createIndex({ serviceCategories: 1 });
    await mongoose.connection.db?.collection('sellerprofiles').createIndex({ rating: -1 });
    await mongoose.connection.db?.collection('sellerprofiles').createIndex({ availability: 1 });

    // Service request indexes
    await mongoose.connection.db?.collection('servicerequests').createIndex({ buyerId: 1 });
    await mongoose.connection.db?.collection('servicerequests').createIndex({ sellerId: 1 });
    await mongoose.connection.db?.collection('servicerequests').createIndex({ category: 1 });
    await mongoose.connection.db?.collection('servicerequests').createIndex({ status: 1 });
    await mongoose.connection.db?.collection('servicerequests').createIndex({ 'location.coordinates': '2dsphere' });
    await mongoose.connection.db?.collection('servicerequests').createIndex({ createdAt: -1 });
    await mongoose.connection.db?.collection('servicerequests').createIndex({ expiresAt: 1 });

    // Transaction indexes
    await mongoose.connection.db?.collection('transactions').createIndex({ serviceRequestId: 1 });
    await mongoose.connection.db?.collection('transactions').createIndex({ buyerId: 1 });
    await mongoose.connection.db?.collection('transactions').createIndex({ sellerId: 1 });
    await mongoose.connection.db?.collection('transactions').createIndex({ status: 1 });
    await mongoose.connection.db?.collection('transactions').createIndex({ createdAt: -1 });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
  }
};

// Seed database with initial data
export const seedDatabase = async (): Promise<void> => {
  try {
    // Check if admin user exists
    const User = mongoose.model('User');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      // Create default admin user
      const bcrypt = require('bcrypt');
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@serviceshub.com',
        password: await bcrypt.hash('Admin123!', 12),
        role: 'admin',
        status: 'active',
        emailVerified: true
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created');
    }
    
    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Database health check
export const healthCheck = async (): Promise<{ status: string; details: any }> => {
  try {
    const stats = await getDatabaseStats();
    
    if (stats.connected) {
      return {
        status: 'healthy',
        details: stats
      };
    } else {
      return {
        status: 'unhealthy',
        details: stats
      };
    }
  } catch (error) {
    return {
      status: 'error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

export default {
  connectDatabase,
  disconnectDatabase,
  getConnectionStatus,
  isDatabaseConnected,
  getDatabaseStats,
  createIndexes,
  seedDatabase,
  healthCheck
};