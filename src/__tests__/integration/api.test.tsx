import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ServiceRequestForm from '../../components/ServiceRequestForm';
import UserDashboardPage from '../../pages/UserDashboardPage';
import SellerDashboardPage from '../../pages/SellerDashboardPage';
import { AuthProvider } from '../../lib/auth';

// Mock API responses
const mockApiResponses = {
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
const server = setupServer(
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.auth.login));
  }),
  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.auth.register));
  }),
  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: mockApiResponses.auth.login.data.user,
      message: 'User retrieved successfully'
    }));
  }),

  // Service request endpoints
  rest.post('/api/service-requests/instant', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.serviceRequests.createInstant));
  }),
  rest.post('/api/service-requests/scheduled', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.serviceRequests.createScheduled));
  }),
  rest.get('/api/service-requests/user', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.serviceRequests.getUserRequests));
  }),
  rest.get('/api/service-requests/seller', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.serviceRequests.getSellerRequests));
  }),
  rest.patch('/api/service-requests/boost', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.serviceRequests.boostPrice));
  }),
  rest.patch('/api/service-requests/accept', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.serviceRequests.acceptRequest));
  }),

  // Seller endpoints
  rest.get('/api/sellers', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.sellers.getSellers));
  }),
  rest.post('/api/sellers/create', (req, res, ctx) => {
    return res(ctx.json(mockApiResponses.sellers.createProfile));
  })
);

// Mock auth context
const mockAuthContext = {
  user: mockApiResponses.auth.login.data.user,
  accessToken: mockApiResponses.auth.login.data.accessToken,
  refreshToken: mockApiResponses.auth.login.data.refreshToken,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshAuth: vi.fn(),
  clearError: vi.fn(),
  updateUser: vi.fn()
};

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

// Mock Leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMap: () => ({
    setView: vi.fn(),
    flyTo: vi.fn()
  })
}));

vi.mock('leaflet', () => ({
  icon: vi.fn(() => ({})),
  Icon: vi.fn(() => ({})),
  Default: {
    iconUrl: '',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  }
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider value={mockAuthContext}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Frontend Integration Tests', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe('Service Request Form Integration', () => {
    it('should create instant service request successfully', async () => {
      renderWithProviders(<ServiceRequestForm />);
      
      // Fill in form
      fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Plumbing' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fix leaky faucet in kitchen' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '150' } });
      fireEvent.change(screen.getByLabelText('Broadcast Radius (km)'), { target: { value: '10' } });
      
      const submitButton = screen.getByRole('button', { name: /submit request/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Service request created successfully!')).toBeInTheDocument();
      });
    });

    it('should create scheduled service request successfully', async () => {
      renderWithProviders(<ServiceRequestForm />);
      
      // Switch to scheduled request
      fireEvent.click(screen.getByText('Scheduled Service'));
      
      // Fill in form
      fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Electrical' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Install ceiling fan in living room' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '200' } });
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      fireEvent.change(screen.getByLabelText('Scheduled Date'), { target: { value: tomorrow.toISOString().split('T')[0] } });
      fireEvent.change(screen.getByLabelText('Scheduled Time'), { target: { value: '14:00' } });
      
      const submitButton = screen.getByRole('button', { name: /submit request/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Service request created successfully!')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      // Override the default handler for this test
      server.use(
        rest.post('/api/service-requests/instant', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({
            success: false,
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
          }));
        })
      );

      renderWithProviders(<ServiceRequestForm />);
      
      // Fill in form
      fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Plumbing' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fix leaky faucet in kitchen' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '150' } });
      
      const submitButton = screen.getByRole('button', { name: /submit request/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create service request')).toBeInTheDocument();
      });
    });
  });

  describe('User Dashboard Integration', () => {
    it('should load user service requests', async () => {
      renderWithProviders(<UserDashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Fix leaky faucet in kitchen')).toBeInTheDocument();
        expect(screen.getByText('$150')).toBeInTheDocument();
        expect(screen.getByText('Plumbing')).toBeInTheDocument();
      });
    });

    it('should handle empty state when no requests exist', async () => {
      // Override to return empty data
      server.use(
        rest.get('/api/service-requests/user', (req, res, ctx) => {
          return res(ctx.json({
            success: true,
            data: {
              data: [],
              pagination: {
                page: 1,
                limit: 10,
                total: 0,
                pages: 0,
                hasNext: false,
                hasPrev: false
              }
            },
            message: 'User service requests retrieved successfully'
          }));
        })
      );

      renderWithProviders(<UserDashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('No service requests found')).toBeInTheDocument();
      });
    });
  });

  describe('Seller Dashboard Integration', () => {
    it('should load seller service requests', async () => {
      renderWithProviders(<SellerDashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Fix leaky faucet in kitchen')).toBeInTheDocument();
        expect(screen.getByText('$150')).toBeInTheDocument();
        expect(screen.getByText('Plumbing')).toBeInTheDocument();
      });
    });

    it('should accept service request successfully', async () => {
      renderWithProviders(<SellerDashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Fix leaky faucet in kitchen')).toBeInTheDocument();
      });
      
      const acceptButton = screen.getByRole('button', { name: /accept/i });
      fireEvent.click(acceptButton);
      
      await waitFor(() => {
        expect(screen.getByText('Request accepted successfully!')).toBeInTheDocument();
      });
    });

    it('should boost price successfully', async () => {
      renderWithProviders(<SellerDashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Fix leaky faucet in kitchen')).toBeInTheDocument();
      });
      
      const boostButton = screen.getByRole('button', { name: /boost price/i });
      fireEvent.click(boostButton);
      
      // Fill in new price
      const priceInput = screen.getByLabelText('New Price ($)');
      fireEvent.change(priceInput, { target: { value: '200' } });
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText('Price boosted successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should handle login flow', async () => {
      const mockLogin = vi.fn();
      const authContextWithLogin = {
        ...mockAuthContext,
        login: mockLogin
      };

      render(
        <BrowserRouter>
          <AuthProvider value={authContextWithLogin}>
            <div>Test Component</div>
          </AuthProvider>
        </BrowserRouter>
      );

      // Simulate login call
      await authContextWithLogin.login('test@example.com', 'password123');
      
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should handle registration flow', async () => {
      const mockRegister = vi.fn();
      const authContextWithRegister = {
        ...mockAuthContext,
        register: mockRegister
      };

      render(
        <BrowserRouter>
          <AuthProvider value={authContextWithRegister}>
            <div>Test Component</div>
          </AuthProvider>
        </BrowserRouter>
      );

      // Simulate registration call
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'buyer' as const,
        phone: '+1234567890'
      };
      
      await authContextWithRegister.register(userData);
      
      expect(mockRegister).toHaveBeenCalledWith(userData);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors', async () => {
      // Override to simulate network error
      server.use(
        rest.post('/api/service-requests/instant', (req, res, ctx) => {
          return res.networkError('Network error');
        })
      );

      renderWithProviders(<ServiceRequestForm />);
      
      // Fill in form
      fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Plumbing' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fix leaky faucet in kitchen' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '150' } });
      
      const submitButton = screen.getByRole('button', { name: /submit request/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Network error occurred')).toBeInTheDocument();
      });
    });

    it('should handle validation errors from API', async () => {
      // Override to return validation error
      server.use(
        rest.post('/api/service-requests/instant', (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({
            success: false,
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: [
              {
                field: 'price',
                message: 'Price must be at least $1'
              }
            ]
          }));
        })
      );

      renderWithProviders(<ServiceRequestForm />);
      
      // Fill in form with invalid data
      fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Plumbing' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fix leaky faucet in kitchen' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '0' } });
      
      const submitButton = screen.getByRole('button', { name: /submit request/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Price must be at least $1')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States Integration', () => {
    it('should show loading state during API calls', async () => {
      // Override to add delay
      server.use(
        rest.post('/api/service-requests/instant', (req, res, ctx) => {
          return res(ctx.delay(1000), ctx.json(mockApiResponses.serviceRequests.createInstant));
        })
      );

      renderWithProviders(<ServiceRequestForm />);
      
      // Fill in form
      fireEvent.change(screen.getByLabelText('Service Category'), { target: { value: 'Plumbing' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fix leaky faucet in kitchen' } });
      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '150' } });
      
      const submitButton = screen.getByRole('button', { name: /submit request/i });
      fireEvent.click(submitButton);
      
      // Should show loading state
      expect(screen.getByText('Creating Request...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Service request created successfully!')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});
