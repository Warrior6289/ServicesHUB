import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API responses
const mockResponses = {
  auth: {
    login: {
      success: true,
      data: {
        user: {
          _id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'buyer',
          status: 'active',
          emailVerified: true,
          phone: '+1234567890',
          avatar: '',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      },
      message: 'Login successful'
    },
    register: {
      success: true,
      data: {
        user: {
          _id: 'user123',
          name: 'New User',
          email: 'newuser@example.com',
          role: 'buyer',
          status: 'active',
          emailVerified: false,
          phone: '+1234567890',
          avatar: '',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      },
      message: 'Registration successful'
    },
    me: {
      success: true,
      data: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'buyer',
        status: 'active',
        emailVerified: true,
        phone: '+1234567890',
        avatar: '',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      },
      message: 'User retrieved successfully'
    }
  },
  serviceRequests: {
    createInstant: {
      success: true,
      data: {
        _id: 'request123',
        buyerId: 'user123',
        category: 'Plumbing',
        type: 'instant',
        description: 'Fix leaky faucet in kitchen',
        price: 150,
        location: {
          address: '123 Main St, New York, NY 10001',
          coordinates: [-74.006, 40.7128]
        },
        broadcastRadius: 10,
        status: 'pending',
        expiresAt: '2023-01-02T00:00:00.000Z',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      },
      message: 'Instant service request created successfully'
    },
    createScheduled: {
      success: true,
      data: {
        _id: 'request124',
        buyerId: 'user123',
        category: 'Electrical',
        type: 'scheduled',
        description: 'Install ceiling fan in living room',
        price: 200,
        location: {
          address: '456 Oak Ave, Brooklyn, NY 11201',
          coordinates: [-73.9442, 40.6782]
        },
        scheduledDate: '2023-01-08T14:00:00.000Z',
        scheduledTime: '14:00',
        status: 'pending',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      },
      message: 'Scheduled service request created successfully'
    },
    getUserRequests: {
      success: true,
      data: {
        data: [
          {
            _id: 'request123',
            buyerId: 'user123',
            category: 'Plumbing',
            type: 'instant',
            description: 'Fix leaky faucet in kitchen',
            price: 150,
            status: 'pending',
            createdAt: '2023-01-01T00:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
          hasNext: false,
          hasPrev: false
        }
      },
      message: 'User service requests retrieved successfully'
    },
    getSellerRequests: {
      success: true,
      data: {
        data: [
          {
            _id: 'request123',
            buyerId: 'user123',
            sellerId: 'seller123',
            category: 'Plumbing',
            type: 'instant',
            description: 'Fix leaky faucet in kitchen',
            price: 150,
            status: 'accepted',
            createdAt: '2023-01-01T00:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
          hasNext: false,
          hasPrev: false
        }
      },
      message: 'Seller service requests retrieved successfully'
    },
    boostPrice: {
      success: true,
      data: {
        _id: 'request123',
        price: 200,
        status: 'price_boosted',
        priceHistory: [
          {
            price: 200,
            boostedBy: 'user123',
            boostedAt: '2023-01-01T12:00:00.000Z'
          }
        ]
      },
      message: 'Price boosted successfully'
    },
    acceptRequest: {
      success: true,
      data: {
        _id: 'request123',
        sellerId: 'seller123',
        status: 'accepted',
        acceptedAt: '2023-01-01T12:00:00.000Z'
      },
      message: 'Request accepted successfully'
    }
  },
  sellers: {
    getSellers: {
      success: true,
      data: {
        data: [
          {
            _id: 'profile123',
            userId: 'seller123',
            bio: 'Professional plumber with 10+ years experience',
            location: {
              address: '123 Main St, New York, NY 10001',
              coordinates: [-74.006, 40.7128]
            },
            serviceCategories: ['Plumbing'],
            yearsOfExperience: 10,
            rating: 4.8,
            reviewsCount: 45,
            availability: true,
            isApproved: true
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
          hasNext: false,
          hasPrev: false
        }
      },
      message: 'Sellers retrieved successfully'
    },
    createProfile: {
      success: true,
      data: {
        _id: 'profile123',
        userId: 'seller123',
        bio: 'Professional plumber with 10+ years experience',
        location: {
          address: '123 Main St, New York, NY 10001',
          coordinates: [-74.006, 40.7128]
        },
        serviceCategories: ['Plumbing'],
        yearsOfExperience: 10,
        rating: 0,
        reviewsCount: 0,
        availability: true,
        isApproved: false
      },
      message: 'Seller profile created successfully'
    }
  }
};

// Setup MSW server
export const server = setupServer(
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json(mockResponses.auth.login));
  }),
  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(ctx.json(mockResponses.auth.register));
  }),
  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(ctx.json(mockResponses.auth.me));
  }),
  rest.post('/api/auth/refresh', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token'
      },
      message: 'Token refreshed successfully'
    }));
  }),

  // Service request endpoints
  rest.post('/api/service-requests/instant', (req, res, ctx) => {
    return res(ctx.json(mockResponses.serviceRequests.createInstant));
  }),
  rest.post('/api/service-requests/scheduled', (req, res, ctx) => {
    return res(ctx.json(mockResponses.serviceRequests.createScheduled));
  }),
  rest.get('/api/service-requests/user', (req, res, ctx) => {
    return res(ctx.json(mockResponses.serviceRequests.getUserRequests));
  }),
  rest.get('/api/service-requests/seller', (req, res, ctx) => {
    return res(ctx.json(mockResponses.serviceRequests.getSellerRequests));
  }),
  rest.patch('/api/service-requests/boost', (req, res, ctx) => {
    return res(ctx.json(mockResponses.serviceRequests.boostPrice));
  }),
  rest.patch('/api/service-requests/accept', (req, res, ctx) => {
    return res(ctx.json(mockResponses.serviceRequests.acceptRequest));
  }),
  rest.get('/api/service-requests/:id', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        _id: req.params.id,
        buyerId: 'user123',
        category: 'Plumbing',
        type: 'instant',
        description: 'Fix leaky faucet in kitchen',
        price: 150,
        status: 'pending',
        createdAt: '2023-01-01T00:00:00.000Z'
      },
      message: 'Service request retrieved successfully'
    }));
  }),

  // Seller endpoints
  rest.get('/api/sellers', (req, res, ctx) => {
    return res(ctx.json(mockResponses.sellers.getSellers));
  }),
  rest.post('/api/sellers/create', (req, res, ctx) => {
    return res(ctx.json(mockResponses.sellers.createProfile));
  }),
  rest.get('/api/sellers/:id', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        _id: req.params.id,
        userId: 'seller123',
        bio: 'Professional plumber with 10+ years experience',
        location: {
          address: '123 Main St, New York, NY 10001',
          coordinates: [-74.006, 40.7128]
        },
        serviceCategories: ['Plumbing'],
        yearsOfExperience: 10,
        rating: 4.8,
        reviewsCount: 45,
        availability: true,
        isApproved: true
      },
      message: 'Seller profile retrieved successfully'
    }));
  }),

  // User endpoints
  rest.get('/api/users/profile', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: mockResponses.auth.me.data,
      message: 'User profile retrieved successfully'
    }));
  }),
  rest.patch('/api/users/profile', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        ...mockResponses.auth.me.data,
        name: 'Updated User'
      },
      message: 'Profile updated successfully'
    }));
  }),

  // Admin endpoints
  rest.get('/api/admin/stats', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        totalUsers: 100,
        totalSellers: 25,
        totalServiceRequests: 150,
        totalTransactions: 120,
        totalRevenue: 15000,
        activeUsers: 80,
        pendingApprovals: 5
      },
      message: 'Admin stats retrieved successfully'
    }));
  }),
  rest.get('/api/admin/users', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: {
        data: [
          {
            _id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'buyer',
            status: 'active',
            createdAt: '2023-01-01T00:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
          hasNext: false,
          hasPrev: false
        }
      },
      message: 'Users retrieved successfully'
    }));
  })
);
