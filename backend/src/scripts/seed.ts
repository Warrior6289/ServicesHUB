import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config/env';
import { User } from '../models/User';
import { SellerProfile } from '../models/SellerProfile';
import { ServiceRequest } from '../models/ServiceRequest';
import { Transaction } from '../models/Transaction';
import { log } from '../services/loggerService';

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(config.database.url, config.database.options);
    log.info('Connected to MongoDB for seeding');
  } catch (error) {
    log.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'buyer',
    phone: '+1234567890',
    emailVerified: true,
    status: 'active'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'seller',
    phone: '+1234567891',
    emailVerified: true,
    status: 'active'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    role: 'seller',
    phone: '+1234567892',
    emailVerified: true,
    status: 'active'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1234567893',
    emailVerified: true,
    status: 'active'
  }
];

const sampleSellerProfiles = [
  {
    bio: 'Professional plumber with 10+ years of experience. Specializing in residential and commercial plumbing services.',
    location: {
      address: '123 Main St, New York, NY 10001',
      coordinates: [-74.006, 40.7128]
    },
    serviceCategories: ['Plumbing'],
    yearsOfExperience: 10,
    certifications: ['Licensed Plumber', 'Certified Pipe Fitter'],
    profilePicture: '',
    portfolio: [],
    rating: 4.8,
    reviewsCount: 45,
    availability: true,
    isApproved: true
  },
  {
    bio: 'Experienced electrician providing quality electrical services for homes and businesses.',
    location: {
      address: '456 Oak Ave, Brooklyn, NY 11201',
      coordinates: [-73.9442, 40.6782]
    },
    serviceCategories: ['Electrical'],
    yearsOfExperience: 8,
    certifications: ['Licensed Electrician', 'Master Electrician'],
    profilePicture: '',
    portfolio: [],
    rating: 4.9,
    reviewsCount: 32,
    availability: true,
    isApproved: true
  }
];

const sampleServiceRequests = [
  {
    category: 'Plumbing',
    type: 'instant',
    description: 'Kitchen sink is clogged and water is backing up. Need immediate assistance.',
    price: 150,
    location: {
      address: '789 Pine St, Manhattan, NY 10002',
      coordinates: [-73.9857, 40.7484]
    },
    broadcastRadius: 15,
    status: 'pending',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    category: 'Electrical',
    type: 'scheduled',
    description: 'Need to install new ceiling fan in living room. Prefer weekend appointment.',
    price: 200,
    location: {
      address: '321 Elm St, Queens, NY 11101',
      coordinates: [-73.9442, 40.6782]
    },
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    scheduledTime: '14:00',
    status: 'pending'
  },
  {
    category: 'Cleaning',
    type: 'instant',
    description: 'Deep cleaning needed for 2-bedroom apartment. Move-out cleaning required.',
    price: 300,
    location: {
      address: '654 Maple Ave, Bronx, NY 10451',
      coordinates: [-73.9339, 40.8448]
    },
    broadcastRadius: 20,
    status: 'accepted',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    log.info('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await SellerProfile.deleteMany({});
    await ServiceRequest.deleteMany({});
    await Transaction.deleteMany({});
    log.info('Cleared existing data');

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      users.push(user);
      log.info(`Created user: ${user.name} (${user.email})`);
    }

    // Create seller profiles
    const sellerProfiles = [];
    for (let i = 0; i < sampleSellerProfiles.length; i++) {
      const profileData = sampleSellerProfiles[i];
      const sellerUser = users.find(u => u.role === 'seller' && u.email === ['jane@example.com', 'mike@example.com'][i]);
      
      if (sellerUser) {
        const sellerProfile = new SellerProfile({
          ...profileData,
          userId: sellerUser._id
        });
        await sellerProfile.save();
        sellerProfiles.push(sellerProfile);
        log.info(`Created seller profile for: ${sellerUser.name}`);
      }
    }

    // Create service requests
    const serviceRequests = [];
    for (let i = 0; i < sampleServiceRequests.length; i++) {
      const requestData = sampleServiceRequests[i];
      const buyerUser = users.find(u => u.role === 'buyer');
      
      if (buyerUser) {
        const serviceRequest = new ServiceRequest({
          ...requestData,
          buyerId: buyerUser._id,
          sellerId: i === 2 ? sellerProfiles[0]?._id : undefined // Assign seller to third request
        });
        await serviceRequest.save();
        serviceRequests.push(serviceRequest);
        log.info(`Created service request: ${serviceRequest.category} - ${serviceRequest.description.substring(0, 50)}...`);
      }
    }

    // Create sample transactions
    const completedRequest = serviceRequests.find(r => r.status === 'accepted');
    if (completedRequest) {
      const transaction = new Transaction({
        buyerId: completedRequest.buyerId,
        sellerId: completedRequest.sellerId,
        serviceRequestId: completedRequest._id,
        amount: completedRequest.price,
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: `txn_${Date.now()}`,
        completedAt: new Date()
      });
      await transaction.save();
      log.info(`Created transaction: ${transaction.transactionId}`);
    }

    log.info('Database seeding completed successfully!');
    log.info(`Created ${users.length} users, ${sellerProfiles.length} seller profiles, ${serviceRequests.length} service requests, and 1 transaction`);

  } catch (error) {
    log.error('Error seeding database:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    log.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

export default seedDatabase;
