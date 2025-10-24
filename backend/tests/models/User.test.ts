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

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'buyer',
        phone: '+1234567890'
      };

      const user = new User(userData);
      await user.save();

      expect(user._id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'seller'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });

    it('should validate required fields', async () => {
      const user = new User({});
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.name).toBeDefined();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.password).toBeDefined();
      }
    });

    it('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        role: 'buyer'
      };

      const user = new User(userData);
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.email).toBeDefined();
      }
    });

    it('should validate role enum', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role'
      };

      const user = new User(userData);
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.role).toBeDefined();
      }
    });
  });

  describe('User Methods', () => {
    it('should compare password correctly', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'buyer'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should generate JWT token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'buyer'
      };

      const user = new User(userData);
      await user.save();

      const token = user.generateAuthToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token can be decoded
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      expect(decoded.userId).toBe(user._id.toString());
      expect(decoded.email).toBe(user.email);
    });
  });

  describe('User Indexes', () => {
    it('should create unique index on email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'buyer'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      
      try {
        await user2.save();
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });
  });
});

describe('ServiceRequest Model', () => {
  let buyer: any;
  let seller: any;

  beforeEach(async () => {
    // Create test users
    buyer = new User({
      name: 'Buyer User',
      email: 'buyer@example.com',
      password: 'password123',
      role: 'buyer'
    });
    await buyer.save();

    seller = new User({
      name: 'Seller User',
      email: 'seller@example.com',
      password: 'password123',
      role: 'seller'
    });
    await seller.save();
  });

  describe('ServiceRequest Creation', () => {
    it('should create instant service request', async () => {
      const requestData = {
        buyerId: buyer._id,
        category: 'Plumbing',
        type: 'instant',
        description: 'Fix leaky faucet',
        price: 150,
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        },
        broadcastRadius: 10,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      const serviceRequest = new ServiceRequest(requestData);
      await serviceRequest.save();

      expect(serviceRequest._id).toBeDefined();
      expect(serviceRequest.buyerId).toEqual(buyer._id);
      expect(serviceRequest.category).toBe(requestData.category);
      expect(serviceRequest.type).toBe(requestData.type);
      expect(serviceRequest.status).toBe('pending');
    });

    it('should create scheduled service request', async () => {
      const requestData = {
        buyerId: buyer._id,
        category: 'Electrical',
        type: 'scheduled',
        description: 'Install ceiling fan',
        price: 200,
        location: {
          address: '456 Oak Ave',
          coordinates: [-73.9442, 40.6782]
        },
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        scheduledTime: '14:00'
      };

      const serviceRequest = new ServiceRequest(requestData);
      await serviceRequest.save();

      expect(serviceRequest._id).toBeDefined();
      expect(serviceRequest.type).toBe('scheduled');
      expect(serviceRequest.scheduledDate).toBeDefined();
      expect(serviceRequest.scheduledTime).toBe('14:00');
    });

    it('should validate required fields', async () => {
      const serviceRequest = new ServiceRequest({});
      
      try {
        await serviceRequest.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.buyerId).toBeDefined();
        expect(error.errors.category).toBeDefined();
        expect(error.errors.description).toBeDefined();
        expect(error.errors.price).toBeDefined();
      }
    });

    it('should validate price range', async () => {
      const requestData = {
        buyerId: buyer._id,
        category: 'Plumbing',
        type: 'instant',
        description: 'Test request',
        price: -10, // Invalid negative price
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        }
      };

      const serviceRequest = new ServiceRequest(requestData);
      
      try {
        await serviceRequest.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.price).toBeDefined();
      }
    });
  });

  describe('ServiceRequest Methods', () => {
    let serviceRequest: any;

    beforeEach(async () => {
      serviceRequest = new ServiceRequest({
        buyerId: buyer._id,
        category: 'Plumbing',
        type: 'instant',
        description: 'Fix leaky faucet',
        price: 150,
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        },
        broadcastRadius: 10,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      await serviceRequest.save();
    });

    it('should boost price correctly', async () => {
      const newPrice = 200;
      await serviceRequest.boostPrice(newPrice, buyer._id);

      expect(serviceRequest.price).toBe(newPrice);
      expect(serviceRequest.status).toBe('price_boosted');
      expect(serviceRequest.priceHistory).toHaveLength(1);
      expect(serviceRequest.priceHistory[0].price).toBe(newPrice);
    });

    it('should accept request correctly', async () => {
      await serviceRequest.acceptRequest(seller._id);

      expect(serviceRequest.sellerId).toEqual(seller._id);
      expect(serviceRequest.status).toBe('accepted');
      expect(serviceRequest.acceptedAt).toBeDefined();
    });

    it('should not allow boosting price lower than current', async () => {
      try {
        await serviceRequest.boostPrice(100, buyer._id);
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('New price must be higher than current price');
      }
    });

    it('should not allow accepting already accepted request', async () => {
      await serviceRequest.acceptRequest(seller._id);
      
      try {
        await serviceRequest.acceptRequest(seller._id);
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Request has already been accepted');
      }
    });
  });

  describe('ServiceRequest Virtuals', () => {
    it('should calculate time remaining correctly', async () => {
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      const serviceRequest = new ServiceRequest({
        buyerId: buyer._id,
        category: 'Plumbing',
        type: 'instant',
        description: 'Test request',
        price: 150,
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        },
        expiresAt
      });
      await serviceRequest.save();

      const timeRemaining = serviceRequest.timeRemaining;
      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThan(2 * 60 * 60 * 1000);
    });

    it('should detect expired requests', async () => {
      const expiresAt = new Date(Date.now() - 1000); // 1 second ago
      const serviceRequest = new ServiceRequest({
        buyerId: buyer._id,
        category: 'Plumbing',
        type: 'instant',
        description: 'Test request',
        price: 150,
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        },
        expiresAt
      });
      await serviceRequest.save();

      expect(serviceRequest.isExpired).toBe(true);
    });
  });
});

describe('SellerProfile Model', () => {
  let seller: any;

  beforeEach(async () => {
    seller = new User({
      name: 'Seller User',
      email: 'seller@example.com',
      password: 'password123',
      role: 'seller'
    });
    await seller.save();
  });

  describe('SellerProfile Creation', () => {
    it('should create seller profile with valid data', async () => {
      const profileData = {
        userId: seller._id,
        bio: 'Professional plumber with 10+ years experience',
        location: {
          address: '123 Main St, New York, NY',
          coordinates: [-74.006, 40.7128]
        },
        serviceCategories: ['Plumbing', 'HVAC'],
        yearsOfExperience: 10,
        certifications: ['Licensed Plumber'],
        rating: 0,
        reviewsCount: 0,
        availability: true,
        isApproved: false
      };

      const profile = new SellerProfile(profileData);
      await profile.save();

      expect(profile._id).toBeDefined();
      expect(profile.userId).toEqual(seller._id);
      expect(profile.bio).toBe(profileData.bio);
      expect(profile.serviceCategories).toEqual(profileData.serviceCategories);
      expect(profile.isApproved).toBe(false);
    });

    it('should validate required fields', async () => {
      const profile = new SellerProfile({});
      
      try {
        await profile.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.userId).toBeDefined();
        expect(error.errors.bio).toBeDefined();
        expect(error.errors.location).toBeDefined();
        expect(error.errors.serviceCategories).toBeDefined();
      }
    });

    it('should validate years of experience range', async () => {
      const profileData = {
        userId: seller._id,
        bio: 'Test bio',
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        },
        serviceCategories: ['Plumbing'],
        yearsOfExperience: -1 // Invalid negative value
      };

      const profile = new SellerProfile(profileData);
      
      try {
        await profile.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.yearsOfExperience).toBeDefined();
      }
    });
  });

  describe('SellerProfile Methods', () => {
    let profile: any;

    beforeEach(async () => {
      profile = new SellerProfile({
        userId: seller._id,
        bio: 'Professional plumber',
        location: {
          address: '123 Main St',
          coordinates: [-74.006, 40.7128]
        },
        serviceCategories: ['Plumbing'],
        yearsOfExperience: 5,
        rating: 4.5,
        reviewsCount: 10
      });
      await profile.save();
    });

    it('should update rating correctly', async () => {
      const newRating = 4.8;
      const newReviewCount = 15;
      
      await profile.updateRating(newRating, newReviewCount);
      
      expect(profile.rating).toBe(newRating);
      expect(profile.reviewsCount).toBe(newReviewCount);
    });

    it('should toggle availability', async () => {
      expect(profile.availability).toBe(true);
      
      await profile.toggleAvailability();
      expect(profile.availability).toBe(false);
      
      await profile.toggleAvailability();
      expect(profile.availability).toBe(true);
    });
  });
});

describe('Transaction Model', () => {
  let buyer: any;
  let seller: any;
  let serviceRequest: any;

  beforeEach(async () => {
    buyer = new User({
      name: 'Buyer User',
      email: 'buyer@example.com',
      password: 'password123',
      role: 'buyer'
    });
    await buyer.save();

    seller = new User({
      name: 'Seller User',
      email: 'seller@example.com',
      password: 'password123',
      role: 'seller'
    });
    await seller.save();

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

  describe('Transaction Creation', () => {
    it('should create transaction with valid data', async () => {
      const transactionData = {
        buyerId: buyer._id,
        sellerId: seller._id,
        serviceRequestId: serviceRequest._id,
        amount: 150,
        status: 'pending',
        paymentMethod: 'credit_card',
        transactionId: 'txn_123456789'
      };

      const transaction = new Transaction(transactionData);
      await transaction.save();

      expect(transaction._id).toBeDefined();
      expect(transaction.buyerId).toEqual(buyer._id);
      expect(transaction.sellerId).toEqual(seller._id);
      expect(transaction.serviceRequestId).toEqual(serviceRequest._id);
      expect(transaction.amount).toBe(150);
      expect(transaction.status).toBe('pending');
    });

    it('should validate required fields', async () => {
      const transaction = new Transaction({});
      
      try {
        await transaction.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.buyerId).toBeDefined();
        expect(error.errors.sellerId).toBeDefined();
        expect(error.errors.serviceRequestId).toBeDefined();
        expect(error.errors.amount).toBeDefined();
      }
    });

    it('should validate amount is positive', async () => {
      const transactionData = {
        buyerId: buyer._id,
        sellerId: seller._id,
        serviceRequestId: serviceRequest._id,
        amount: -100, // Invalid negative amount
        status: 'pending',
        paymentMethod: 'credit_card'
      };

      const transaction = new Transaction(transactionData);
      
      try {
        await transaction.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.amount).toBeDefined();
      }
    });
  });

  describe('Transaction Methods', () => {
    let transaction: any;

    beforeEach(async () => {
      transaction = new Transaction({
        buyerId: buyer._id,
        sellerId: seller._id,
        serviceRequestId: serviceRequest._id,
        amount: 150,
        status: 'pending',
        paymentMethod: 'credit_card',
        transactionId: 'txn_123456789'
      });
      await transaction.save();
    });

    it('should mark transaction as completed', async () => {
      await transaction.markCompleted();
      
      expect(transaction.status).toBe('completed');
      expect(transaction.completedAt).toBeDefined();
    });

    it('should mark transaction as failed', async () => {
      const failureReason = 'Payment declined';
      await transaction.markFailed(failureReason);
      
      expect(transaction.status).toBe('failed');
      expect(transaction.failureReason).toBe(failureReason);
      expect(transaction.failedAt).toBeDefined();
    });

    it('should refund transaction', async () => {
      await transaction.refund('Customer requested refund');
      
      expect(transaction.status).toBe('refunded');
      expect(transaction.refundReason).toBe('Customer requested refund');
      expect(transaction.refundedAt).toBeDefined();
    });
  });
});
