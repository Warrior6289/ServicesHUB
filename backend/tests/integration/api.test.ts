import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../src/models/User';
import { ServiceRequest } from '../../src/models/ServiceRequest';
import { SellerProfile } from '../../src/models/SellerProfile';
import { Transaction } from '../../src/models/Transaction';
import { config } from '../../src/config/env';

// Test setup
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  await User.deleteMany({});
  await ServiceRequest.deleteMany({});
  await SellerProfile.deleteMany({});
  await Transaction.deleteMany({});
});

describe('API Integration Tests', () => {
  let buyer: any;
  let seller: any;
  let admin: any;
  let buyerToken: string;
  let sellerToken: string;
  let adminToken: string;

  beforeEach(async () => {
    // Create test users
    buyer = new User({
      name: 'Buyer User',
      email: 'buyer@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'buyer',
      phone: '+1234567890',
      emailVerified: true,
      status: 'active'
    });
    await buyer.save();

    seller = new User({
      name: 'Seller User',
      email: 'seller@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'seller',
      phone: '+1234567891',
      emailVerified: true,
      status: 'active'
    });
    await seller.save();

    admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'admin',
      phone: '+1234567892',
      emailVerified: true,
      status: 'active'
    });
    await admin.save();

    // Generate tokens
    buyerToken = jwt.sign(
      { userId: buyer._id, email: buyer.email, role: buyer.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    sellerToken = jwt.sign(
      { userId: seller._id, email: seller.email, role: seller.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    adminToken = jwt.sign(
      { userId: admin._id, email: admin.email, role: admin.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  });

  describe('Authentication Flow', () => {
    it('should complete user registration and login flow', async () => {
      // Test registration
      const registrationData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'buyer',
        phone: '+1234567893'
      };

      // Note: In a real integration test, you would make HTTP requests to your API
      // For this example, we're testing the models directly
      const newUser = new User(registrationData);
      await newUser.save();

      expect(newUser._id).toBeDefined();
      expect(newUser.email).toBe(registrationData.email);
      expect(newUser.role).toBe(registrationData.role);

      // Test login (password comparison)
      const isPasswordValid = await newUser.comparePassword(registrationData.password);
      expect(isPasswordValid).toBe(true);

      // Test token generation
      const token = newUser.generateAuthToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      expect(decoded.userId).toBe(newUser._id.toString());
    });

    it('should handle invalid login credentials', async () => {
      const invalidPassword = await buyer.comparePassword('wrongpassword');
      expect(invalidPassword).toBe(false);
    });

    it('should handle user not found during login', async () => {
      const nonExistentUser = await User.findOne({ email: 'nonexistent@example.com' });
      expect(nonExistentUser).toBeNull();
    });
  });

  describe('Service Request Flow', () => {
    it('should complete instant service request creation and acceptance flow', async () => {
      // Create instant service request
      const serviceRequestData = {
        buyerId: buyer._id,
        category: 'Plumbing',
        type: 'instant',
        description: 'Fix leaky faucet in kitchen',
        price: 150,
        location: {
          address: '123 Main St, New York, NY 10001',
          coordinates: [-74.006, 40.7128]
        },
        broadcastRadius: 10,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      const serviceRequest = new ServiceRequest(serviceRequestData);
      await serviceRequest.save();

      expect(serviceRequest._id).toBeDefined();
      expect(serviceRequest.status).toBe('pending');
      expect(serviceRequest.buyerId).toEqual(buyer._id);

      // Seller accepts the request
      await serviceRequest.acceptRequest(seller._id);

      expect(serviceRequest.sellerId).toEqual(seller._id);
      expect(serviceRequest.status).toBe('accepted');
      expect(serviceRequest.acceptedAt).toBeDefined();

      // Create transaction
      const transaction = new Transaction({
        buyerId: buyer._id,
        sellerId: seller._id,
        serviceRequestId: serviceRequest._id,
        amount: serviceRequest.price,
        status: 'pending',
        paymentMethod: 'credit_card',
        transactionId: `txn_${Date.now()}`
      });
      await transaction.save();

      expect(transaction._id).toBeDefined();
      expect(transaction.buyerId).toEqual(buyer._id);
      expect(transaction.sellerId).toEqual(seller._id);
      expect(transaction.serviceRequestId).toEqual(serviceRequest._id);

      // Complete transaction
      await transaction.markCompleted();

      expect(transaction.status).toBe('completed');
      expect(transaction.completedAt).toBeDefined();
    });

    it('should complete scheduled service request flow', async () => {
      const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now

      const serviceRequestData = {
        buyerId: buyer._id,
        category: 'Electrical',
        type: 'scheduled',
        description: 'Install ceiling fan in living room',
        price: 200,
        location: {
          address: '456 Oak Ave, Brooklyn, NY 11201',
          coordinates: [-73.9442, 40.6782]
        },
        scheduledDate,
        scheduledTime: '14:00'
      };

      const serviceRequest = new ServiceRequest(serviceRequestData);
      await serviceRequest.save();

      expect(serviceRequest._id).toBeDefined();
      expect(serviceRequest.type).toBe('scheduled');
      expect(serviceRequest.scheduledDate).toEqual(scheduledDate);
      expect(serviceRequest.scheduledTime).toBe('14:00');
    });

    it('should handle price boosting flow', async () => {
      const serviceRequestData = {
        buyerId: buyer._id,
        category: 'Cleaning',
        type: 'instant',
        description: 'Deep cleaning for 2-bedroom apartment',
        price: 300,
        location: {
          address: '789 Pine St, Manhattan, NY 10002',
          coordinates: [-73.9857, 40.7484]
        },
        broadcastRadius: 15,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      const serviceRequest = new ServiceRequest(serviceRequestData);
      await serviceRequest.save();

      // Boost price
      const newPrice = 400;
      await serviceRequest.boostPrice(newPrice, buyer._id);

      expect(serviceRequest.price).toBe(newPrice);
      expect(serviceRequest.status).toBe('price_boosted');
      expect(serviceRequest.priceHistory).toHaveLength(1);
      expect(serviceRequest.priceHistory[0].price).toBe(newPrice);
      expect(serviceRequest.priceHistory[0].boostedBy).toEqual(buyer._id);
    });

    it('should handle request expiration', async () => {
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago

      const serviceRequestData = {
        buyerId: buyer._id,
        category: 'HVAC',
        type: 'instant',
        description: 'Fix air conditioning unit',
        price: 250,
        location: {
          address: '321 Elm St, Queens, NY 11101',
          coordinates: [-73.9442, 40.6782]
        },
        broadcastRadius: 20,
        expiresAt: expiredDate
      };

      const serviceRequest = new ServiceRequest(serviceRequestData);
      await serviceRequest.save();

      expect(serviceRequest.isExpired).toBe(true);
      expect(serviceRequest.timeRemaining).toBeLessThan(0);
    });
  });

  describe('Seller Profile Flow', () => {
    it('should complete seller profile creation and approval flow', async () => {
      // Create seller profile
      const profileData = {
        userId: seller._id,
        bio: 'Professional plumber with 10+ years of experience',
        location: {
          address: '123 Main St, New York, NY 10001',
          coordinates: [-74.006, 40.7128]
        },
        serviceCategories: ['Plumbing', 'HVAC'],
        yearsOfExperience: 10,
        certifications: ['Licensed Plumber', 'Certified Pipe Fitter'],
        profilePicture: '',
        portfolio: [],
        rating: 0,
        reviewsCount: 0,
        availability: true,
        isApproved: false
      };

      const sellerProfile = new SellerProfile(profileData);
      await sellerProfile.save();

      expect(sellerProfile._id).toBeDefined();
      expect(sellerProfile.userId).toEqual(seller._id);
      expect(sellerProfile.isApproved).toBe(false);

      // Admin approves seller
      sellerProfile.isApproved = true;
      await sellerProfile.save();

      expect(sellerProfile.isApproved).toBe(true);

      // Update rating
      await sellerProfile.updateRating(4.8, 15);

      expect(sellerProfile.rating).toBe(4.8);
      expect(sellerProfile.reviewsCount).toBe(15);
    });

    it('should handle seller availability toggle', async () => {
      const profileData = {
        userId: seller._id,
        bio: 'Professional electrician',
        location: {
          address: '456 Oak Ave, Brooklyn, NY 11201',
          coordinates: [-73.9442, 40.6782]
        },
        serviceCategories: ['Electrical'],
        yearsOfExperience: 8,
        availability: true,
        isApproved: true
      };

      const sellerProfile = new SellerProfile(profileData);
      await sellerProfile.save();

      expect(sellerProfile.availability).toBe(true);

      // Toggle availability
      await sellerProfile.toggleAvailability();
      expect(sellerProfile.availability).toBe(false);

      await sellerProfile.toggleAvailability();
      expect(sellerProfile.availability).toBe(true);
    });
  });

  describe('Transaction Flow', () => {
    let serviceRequest: any;

    beforeEach(async () => {
      serviceRequest = new ServiceRequest({
        buyerId: buyer._id,
        sellerId: seller._id,
        category: 'Plumbing',
        type: 'instant',
        description: 'Fix leaky faucet',
        price: 150,
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        },
        status: 'accepted'
      });
      await serviceRequest.save();
    });

    it('should complete payment and refund flow', async () => {
      // Create transaction
      const transaction = new Transaction({
        buyerId: buyer._id,
        sellerId: seller._id,
        serviceRequestId: serviceRequest._id,
        amount: 150,
        status: 'pending',
        paymentMethod: 'credit_card',
        transactionId: `txn_${Date.now()}`
      });
      await transaction.save();

      // Complete payment
      await transaction.markCompleted();
      expect(transaction.status).toBe('completed');
      expect(transaction.completedAt).toBeDefined();

      // Process refund
      await transaction.refund('Customer requested refund');
      expect(transaction.status).toBe('refunded');
      expect(transaction.refundReason).toBe('Customer requested refund');
      expect(transaction.refundedAt).toBeDefined();
    });

    it('should handle payment failure', async () => {
      const transaction = new Transaction({
        buyerId: buyer._id,
        sellerId: seller._id,
        serviceRequestId: serviceRequest._id,
        amount: 150,
        status: 'pending',
        paymentMethod: 'credit_card',
        transactionId: `txn_${Date.now()}`
      });
      await transaction.save();

      // Mark as failed
      const failureReason = 'Insufficient funds';
      await transaction.markFailed(failureReason);

      expect(transaction.status).toBe('failed');
      expect(transaction.failureReason).toBe(failureReason);
      expect(transaction.failedAt).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const invalidUser = new User({
        name: '', // Invalid empty name
        email: 'invalid-email', // Invalid email format
        password: '123', // Too short password
        role: 'invalid-role' // Invalid role
      });

      try {
        await invalidUser.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.name).toBeDefined();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.password).toBeDefined();
        expect(error.errors.role).toBeDefined();
      }
    });

    it('should handle duplicate email errors', async () => {
      const user1 = new User({
        name: 'User 1',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'buyer'
      });
      await user1.save();

      const user2 = new User({
        name: 'User 2',
        email: 'duplicate@example.com', // Same email
        password: 'password123',
        role: 'seller'
      });

      try {
        await user2.save();
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });

    it('should handle invalid ObjectId references', async () => {
      const serviceRequest = new ServiceRequest({
        buyerId: 'invalid-object-id',
        category: 'Plumbing',
        type: 'instant',
        description: 'Test request',
        price: 150,
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        }
      });

      try {
        await serviceRequest.save();
        fail('Should have thrown cast error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.buyerId).toBeDefined();
      }
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      // Create service request
      const serviceRequest = new ServiceRequest({
        buyerId: buyer._id,
        category: 'Plumbing',
        type: 'instant',
        description: 'Test request',
        price: 150,
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        }
      });
      await serviceRequest.save();

      // Create transaction
      const transaction = new Transaction({
        buyerId: buyer._id,
        sellerId: seller._id,
        serviceRequestId: serviceRequest._id,
        amount: 150,
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: `txn_${Date.now()}`
      });
      await transaction.save();

      // Verify relationships
      const populatedTransaction = await Transaction.findById(transaction._id)
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email')
        .populate('serviceRequestId', 'description price');

      expect(populatedTransaction.buyerId.name).toBe(buyer.name);
      expect(populatedTransaction.sellerId.name).toBe(seller.name);
      expect(populatedTransaction.serviceRequestId.description).toBe(serviceRequest.description);
    });

    it('should handle cascading deletes properly', async () => {
      // Create seller profile
      const sellerProfile = new SellerProfile({
        userId: seller._id,
        bio: 'Test seller',
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        },
        serviceCategories: ['Plumbing'],
        yearsOfExperience: 5,
        isApproved: true
      });
      await sellerProfile.save();

      // Delete user
      await User.findByIdAndDelete(seller._id);

      // Verify seller profile still exists (no cascade delete)
      const existingProfile = await SellerProfile.findById(sellerProfile._id);
      expect(existingProfile).toBeDefined();
      expect(existingProfile.userId).toEqual(seller._id);
    });
  });
});
