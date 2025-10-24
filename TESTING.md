# Testing Documentation

## Overview

Services Hub includes a comprehensive testing suite with unit tests, integration tests, and end-to-end (E2E) tests to ensure code quality and reliability.

## Test Structure

```
├── backend/
│   ├── tests/
│   │   ├── models/           # Unit tests for data models
│   │   ├── controllers/      # Unit tests for API controllers
│   │   ├── middleware/       # Unit tests for middleware
│   │   └── integration/      # Integration tests for API flows
├── src/
│   ├── components/
│   │   └── __tests__/        # Unit tests for React components
│   └── __tests__/
│       ├── integration/      # Frontend integration tests
│       ├── mocks/           # Mock data and API responses
│       └── setup.ts         # Test setup configuration
└── e2e/                     # End-to-end tests
```

## Running Tests

### Backend Tests

```bash
# Run all backend tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- User.test.ts

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run all frontend tests
npm run test:all
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run all tests (unit + integration + E2E)
npm run test:all
```

## Test Types

### 1. Unit Tests

**Backend Unit Tests:**
- Model validation and methods
- Controller logic
- Middleware functionality
- Utility functions

**Frontend Unit Tests:**
- Component rendering
- User interactions
- Form validation
- State management

### 2. Integration Tests

**Backend Integration Tests:**
- Complete API flows
- Database operations
- Authentication flows
- Error handling

**Frontend Integration Tests:**
- API interactions
- Component integration
- Routing
- State persistence

### 3. End-to-End Tests

**Critical User Journeys:**
- User registration and authentication
- Service request creation
- Seller request acceptance
- Price boosting
- Dashboard functionality
- Error handling
- Responsive design

## Test Configuration

### Jest Configuration (Backend)

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Vitest Configuration (Frontend Integration)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    css: true,
  },
});
```

### Playwright Configuration (E2E)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

## Mock Data and API Responses

### MSW (Mock Service Worker)

The frontend integration tests use MSW to mock API responses:

```typescript
// src/__tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json(mockResponses.auth.login));
  }),
  // ... more endpoints
);
```

### Test Data

Consistent test data is used across all test types:

```typescript
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
  }
};
```

## Test Coverage Goals

- **Backend Unit Tests**: >80% coverage
- **Frontend Unit Tests**: >60% coverage
- **Integration Tests**: Cover all critical API flows
- **E2E Tests**: Cover all critical user journeys

## Best Practices

### Writing Tests

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should create user successfully', async () => {
     // Arrange
     const userData = { name: 'Test', email: 'test@example.com' };
     
     // Act
     const user = await User.create(userData);
     
     // Assert
     expect(user._id).toBeDefined();
     expect(user.email).toBe(userData.email);
   });
   ```

2. **Descriptive Test Names**
   ```typescript
   // Good
   it('should return error when user tries to login with invalid credentials')
   
   // Bad
   it('should handle login error')
   ```

3. **Test One Thing at a Time**
   ```typescript
   // Good - separate tests
   it('should validate required fields')
   it('should validate email format')
   
   // Bad - testing multiple things
   it('should validate form and submit successfully')
   ```

### Mocking

1. **Mock External Dependencies**
   ```typescript
   // Mock external API calls
   vi.mock('axios');
   
   // Mock React components
   vi.mock('react-leaflet', () => ({
     MapContainer: ({ children }) => <div>{children}</div>
   }));
   ```

2. **Use Realistic Mock Data**
   ```typescript
   const mockUser = {
     _id: 'user123',
     name: 'John Doe',
     email: 'john@example.com',
     // ... realistic data
   };
   ```

### Error Testing

1. **Test Error Scenarios**
   ```typescript
   it('should handle API errors gracefully', async () => {
     server.use(
       rest.post('/api/service-requests', (req, res, ctx) => {
         return res(ctx.status(500), ctx.json({ error: 'Server error' }));
       })
     );
     
     // Test error handling
   });
   ```

2. **Test Validation Errors**
   ```typescript
   it('should show validation errors for invalid input', async () => {
     // Test with invalid data
     fireEvent.change(input, { target: { value: 'invalid' } });
     
     // Assert error message appears
     expect(screen.getByText('Invalid input')).toBeInTheDocument();
   });
   ```

## CI/CD Integration

Tests are automatically run in CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
- name: Run Backend Tests
  run: |
    cd backend
    npm test
    
- name: Run Frontend Tests
  run: |
    npm test
    npm run test:integration
    
- name: Run E2E Tests
  run: |
    npm run test:e2e
```

## Debugging Tests

### Backend Tests
```bash
# Run with debug output
npm test -- --verbose

# Run specific test with debug
npm test -- --testNamePattern="should create user" --verbose
```

### Frontend Tests
```bash
# Run with debug output
npm test -- --verbose

# Run in watch mode for debugging
npm run test:watch
```

### E2E Tests
```bash
# Run with debug mode
npm run test:e2e -- --debug

# Run with headed browser
npm run test:e2e:headed

# Run specific test
npm run test:e2e -- --grep "should create service request"
```

## Test Maintenance

1. **Keep Tests Updated**: Update tests when changing functionality
2. **Remove Obsolete Tests**: Delete tests for removed features
3. **Refactor Test Code**: Keep test code clean and maintainable
4. **Monitor Coverage**: Ensure coverage doesn't decrease over time

## Troubleshooting

### Common Issues

1. **Tests Timing Out**
   - Increase timeout in test configuration
   - Check for async operations not being awaited

2. **Mock Not Working**
   - Ensure mocks are set up before tests run
   - Check mock implementation matches expected interface

3. **E2E Tests Failing**
   - Check if dev server is running
   - Verify test data and API responses
   - Check browser compatibility

### Getting Help

- Check test logs for detailed error messages
- Use debug mode to step through failing tests
- Review test configuration files
- Consult testing framework documentation
