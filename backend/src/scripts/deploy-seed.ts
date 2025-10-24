import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config/env';
import { User } from '../models/User';
import { log } from '../services/loggerService';

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(config.database.url, config.database.options);
    log.info('Connected to MongoDB for deployment seeding');
  } catch (error) {
    log.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Create admin user for production
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      log.info('Admin user already exists, skipping creation');
      return existingAdmin;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@serviceshub.com',
      password: await bcrypt.hash(config.admin.defaultPassword, config.jwt.bcryptRounds || 12),
      role: 'admin',
      phone: '+1234567890',
      emailVerified: true,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await adminUser.save();
    log.info('Admin user created successfully');
    log.info(`Admin email: ${adminUser.email}`);
    log.info(`Admin password: ${config.admin.defaultPassword}`);
    log.warn('⚠️  Please change the admin password after first login!');
    
    return adminUser;
  } catch (error) {
    log.error('Failed to create admin user:', error);
    throw error;
  }
};

// Verify database connection and basic functionality
const verifyDatabase = async () => {
  try {
    // Test basic operations
    const userCount = await User.countDocuments();
    log.info(`Database verification successful. Total users: ${userCount}`);
    
    // Test admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      log.info('Admin user verification successful');
    } else {
      log.warn('No admin user found');
    }
    
    return true;
  } catch (error) {
    log.error('Database verification failed:', error);
    return false;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    log.info('Starting deployment database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Create admin user
    await createAdminUser();
    
    // Verify database
    const verified = await verifyDatabase();
    if (!verified) {
      throw new Error('Database verification failed');
    }
    
    log.info('✅ Deployment database seeding completed successfully!');
    log.info('Database is ready for production use.');
    
  } catch (error) {
    log.error('❌ Deployment database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    log.info('Disconnected from MongoDB');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
