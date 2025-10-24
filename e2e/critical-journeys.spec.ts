import { test, expect } from '@playwright/test';

// Test data
const testUsers = {
  buyer: {
    name: 'Test Buyer',
    email: 'buyer@test.com',
    password: 'password123',
    phone: '+1234567890'
  },
  seller: {
    name: 'Test Seller',
    email: 'seller@test.com',
    password: 'password123',
    phone: '+1234567891'
  },
  admin: {
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'password123',
    phone: '+1234567892'
  }
};

const testServiceRequest = {
  category: 'Plumbing',
  description: 'Fix leaky faucet in kitchen sink',
  price: '150',
  broadcastRadius: '10'
};

// Helper functions
async function loginUser(page: any, user: any) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

async function registerUser(page: any, user: any) {
  await page.goto('/register');
  await page.fill('[data-testid="name-input"]', user.name);
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.fill('[data-testid="phone-input"]', user.phone);
  await page.selectOption('[data-testid="role-select"]', 'buyer');
  await page.click('[data-testid="register-button"]');
  await page.waitForURL('/dashboard');
}

async function createServiceRequest(page: any, requestData: any) {
  await page.goto('/request-service');
  
  // Fill in service request form
  await page.selectOption('[data-testid="category-select"]', requestData.category);
  await page.fill('[data-testid="description-textarea"]', requestData.description);
  await page.fill('[data-testid="price-input"]', requestData.price);
  await page.fill('[data-testid="broadcast-radius-input"]', requestData.broadcastRadius);
  
  // Mock geolocation
  await page.evaluate(() => {
    navigator.geolocation.getCurrentPosition = (success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.006
        }
      });
    };
  });
  
  await page.click('[data-testid="submit-request-button"]');
  await page.waitForSelector('[data-testid="success-message"]');
}

test.describe('Services Hub E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: testUsers.buyer,
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh-token'
          },
          message: 'Login successful'
        })
      });
    });

    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: testUsers.buyer,
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh-token'
          },
          message: 'Registration successful'
        })
      });
    });

    await page.route('**/api/service-requests/instant', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            _id: 'request123',
            ...testServiceRequest,
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          message: 'Service request created successfully'
        })
      });
    });

    await page.route('**/api/service-requests/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            data: [
              {
                _id: 'request123',
                ...testServiceRequest,
                status: 'pending',
                createdAt: new Date().toISOString()
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
        })
      });
    });
  });

  test.describe('User Registration and Authentication', () => {
    test('should complete user registration flow', async ({ page }) => {
      await registerUser(page, testUsers.buyer);
      
      // Verify user is logged in and redirected to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="user-name"]')).toContainText(testUsers.buyer.name);
    });

    test('should complete user login flow', async ({ page }) => {
      await loginUser(page, testUsers.buyer);
      
      // Verify user is logged in and redirected to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="user-name"]')).toContainText(testUsers.buyer.name);
    });

    test('should handle invalid login credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'invalid@test.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      await loginUser(page, testUsers.buyer);
      
      // Click logout button
      await page.click('[data-testid="logout-button"]');
      
      // Should be redirected to home page
      await expect(page).toHaveURL('/');
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    });
  });

  test.describe('Service Request Creation', () => {
    test('should create instant service request successfully', async ({ page }) => {
      await loginUser(page, testUsers.buyer);
      await createServiceRequest(page, testServiceRequest);
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Service request created successfully');
    });

    test('should create scheduled service request successfully', async ({ page }) => {
      await loginUser(page, testUsers.buyer);
      await page.goto('/request-service');
      
      // Switch to scheduled request
      await page.click('[data-testid="scheduled-tab"]');
      
      // Fill in scheduled request form
      await page.selectOption('[data-testid="category-select"]', testServiceRequest.category);
      await page.fill('[data-testid="description-textarea"]', testServiceRequest.description);
      await page.fill('[data-testid="price-input"]', testServiceRequest.price);
      
      // Set scheduled date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('[data-testid="scheduled-date-input"]', tomorrow.toISOString().split('T')[0]);
      await page.fill('[data-testid="scheduled-time-input"]', '14:00');
      
      await page.click('[data-testid="submit-request-button"]');
      await page.waitForSelector('[data-testid="success-message"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Service request created successfully');
    });

    test('should validate required fields', async ({ page }) => {
      await loginUser(page, testUsers.buyer);
      await page.goto('/request-service');
      
      // Try to submit without filling required fields
      await page.click('[data-testid="submit-request-button"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="category-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="description-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="price-error"]')).toBeVisible();
    });

    test('should validate price range', async ({ page }) => {
      await loginUser(page, testUsers.buyer);
      await page.goto('/request-service');
      
      // Fill in form with invalid price
      await page.selectOption('[data-testid="category-select"]', testServiceRequest.category);
      await page.fill('[data-testid="description-textarea"]', testServiceRequest.description);
      await page.fill('[data-testid="price-input"]', '0'); // Invalid price
      
      await page.click('[data-testid="submit-request-button"]');
      
      // Should show price validation error
      await expect(page.locator('[data-testid="price-error"]')).toContainText('Price must be at least $1');
    });
  });

  test.describe('User Dashboard', () => {
    test('should display user service requests', async ({ page }) => {
      await loginUser(page, testUsers.buyer);
      
      // Should see service requests on dashboard
      await expect(page.locator('[data-testid="service-request-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="service-request-description"]')).toContainText(testServiceRequest.description);
      await expect(page.locator('[data-testid="service-request-price"]')).toContainText(`$${testServiceRequest.price}`);
    });

    test('should handle empty state', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/service-requests/user', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
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
          })
        });
      });

      await loginUser(page, testUsers.buyer);
      
      // Should see empty state message
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-state"]')).toContainText('No service requests found');
    });

    test('should navigate to service request details', async ({ page }) => {
      await loginUser(page, testUsers.buyer);
      
      // Click on service request card
      await page.click('[data-testid="service-request-card"]');
      
      // Should navigate to service request details page
      await expect(page).toHaveURL(/\/service-request\/request123/);
      await expect(page.locator('[data-testid="service-request-details"]')).toBeVisible();
    });
  });

  test.describe('Seller Dashboard', () => {
    test('should display seller service requests', async ({ page }) => {
      // Mock seller requests response
      await page.route('**/api/service-requests/seller', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              data: [
                {
                  _id: 'request123',
                  ...testServiceRequest,
                  status: 'pending',
                  createdAt: new Date().toISOString()
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
          })
        });
      });

      await loginUser(page, testUsers.seller);
      await page.goto('/seller-dashboard');
      
      // Should see service requests on seller dashboard
      await expect(page.locator('[data-testid="service-request-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="service-request-description"]')).toContainText(testServiceRequest.description);
    });

    test('should accept service request', async ({ page }) => {
      // Mock accept request response
      await page.route('**/api/service-requests/accept', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'request123',
              sellerId: 'seller123',
              status: 'accepted',
              acceptedAt: new Date().toISOString()
            },
            message: 'Request accepted successfully'
          })
        });
      });

      await loginUser(page, testUsers.seller);
      await page.goto('/seller-dashboard');
      
      // Click accept button
      await page.click('[data-testid="accept-request-button"]');
      
      // Should show success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Request accepted successfully');
    });

    test('should boost price', async ({ page }) => {
      // Mock boost price response
      await page.route('**/api/service-requests/boost', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: 'request123',
              price: 200,
              status: 'price_boosted',
              priceHistory: [
                {
                  price: 200,
                  boostedBy: 'seller123',
                  boostedAt: new Date().toISOString()
                }
              ]
            },
            message: 'Price boosted successfully'
          })
        });
      });

      await loginUser(page, testUsers.seller);
      await page.goto('/seller-dashboard');
      
      // Click boost price button
      await page.click('[data-testid="boost-price-button"]');
      
      // Fill in new price
      await page.fill('[data-testid="new-price-input"]', '200');
      
      // Confirm boost
      await page.click('[data-testid="confirm-boost-button"]');
      
      // Should show success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Price boosted successfully');
    });
  });

  test.describe('Navigation and Routing', () => {
    test('should navigate between pages correctly', async ({ page }) => {
      await loginUser(page, testUsers.buyer);
      
      // Test navigation to different pages
      await page.click('[data-testid="request-service-nav"]');
      await expect(page).toHaveURL('/request-service');
      
      await page.click('[data-testid="dashboard-nav"]');
      await expect(page).toHaveURL('/dashboard');
      
      await page.click('[data-testid="profile-nav"]');
      await expect(page).toHaveURL('/profile');
    });

    test('should protect authenticated routes', async ({ page }) => {
      // Try to access protected route without authentication
      await page.goto('/dashboard');
      
      // Should be redirected to login page
      await expect(page).toHaveURL('/login');
    });

    test('should handle 404 pages', async ({ page }) => {
      await page.goto('/non-existent-page');
      
      // Should show 404 page
      await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="404-page"]')).toContainText('Page not found');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error response
      await page.route('**/api/service-requests/instant', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
          })
        });
      });

      await loginUser(page, testUsers.buyer);
      await page.goto('/request-service');
      
      // Fill in form
      await page.selectOption('[data-testid="category-select"]', testServiceRequest.category);
      await page.fill('[data-testid="description-textarea"]', testServiceRequest.description);
      await page.fill('[data-testid="price-input"]', testServiceRequest.price);
      
      await page.click('[data-testid="submit-request-button"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to create service request');
    });

    test('should handle network errors', async ({ page }) => {
      // Mock network error
      await page.route('**/api/service-requests/instant', async (route) => {
        await route.abort('Failed');
      });

      await loginUser(page, testUsers.buyer);
      await page.goto('/request-service');
      
      // Fill in form
      await page.selectOption('[data-testid="category-select"]', testServiceRequest.category);
      await page.fill('[data-testid="description-textarea"]', testServiceRequest.description);
      await page.fill('[data-testid="price-input"]', testServiceRequest.price);
      
      await page.click('[data-testid="submit-request-button"]');
      
      // Should show network error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error occurred');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await loginUser(page, testUsers.buyer);
      
      // Should be able to navigate and use the app on mobile
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Test mobile navigation
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await loginUser(page, testUsers.buyer);
      
      // Should display properly on tablet
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });
  });
});
