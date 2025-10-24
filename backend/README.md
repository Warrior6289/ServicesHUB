# Services Hub Backend API

A production-ready Node.js backend API for Services Hub - a marketplace connecting service providers with customers.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **User Management**: Complete user lifecycle management
- **Service Requests**: Instant and scheduled service requests
- **Seller Profiles**: Comprehensive seller management system
- **Admin Dashboard**: Analytics and user management
- **File Upload**: Image upload with Cloudinary integration
- **Email System**: Automated email notifications
- **Security**: Rate limiting, CORS, helmet, input validation
- **Error Handling**: Centralized error handling with logging
- **Testing**: Unit and integration tests with 80%+ coverage

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Process Management**: PM2

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # MongoDB connection
│   │   ├── env.ts        # Environment variables
│   │   └── cors.ts       # CORS configuration
│   ├── controllers/      # Route controllers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── serviceRequestController.ts
│   │   ├── sellerController.ts
│   │   └── adminController.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── ServiceRequest.ts
│   │   ├── SellerProfile.ts
│   │   └── Transaction.ts
│   ├── routes/          # Express routes
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── serviceRequestRoutes.ts
│   │   ├── sellerRoutes.ts
│   │   └── adminRoutes.ts
│   ├── middleware/      # Custom middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── rateLimiter.ts
│   ├── utils/          # Utility functions
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── app.ts          # Express app configuration
│   └── server.ts       # Server entry point
├── tests/              # Test files
├── uploads/            # File upload directory
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3001
APP_NAME=Services Hub API
APP_URL=http://localhost:3001

# Database
MONGODB_URI=mongodb://localhost:27017/services-hub

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:4173

# Email
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Redis
REDIS_URL=redis://localhost:6379
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/verify-email` | Verify email | No |
| POST | `/api/auth/forgot-password` | Forgot password | No |
| POST | `/api/auth/reset-password` | Reset password | No |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| PUT | `/api/users/password` | Change password | Yes |
| POST | `/api/users/avatar` | Upload avatar | Yes |
| DELETE | `/api/users/account` | Delete account | Yes |
| GET | `/api/users/stats` | Get user stats | Yes |

### Service Request Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/service-requests/instant` | Create instant request | Yes (Buyer) |
| POST | `/api/service-requests/scheduled` | Create scheduled request | Yes (Buyer) |
| GET | `/api/service-requests/user` | Get user requests | Yes |
| GET | `/api/service-requests/seller` | Get seller requests | Yes (Seller) |
| GET | `/api/service-requests/:id` | Get request by ID | Yes |
| PUT | `/api/service-requests/:id/boost` | Boost price | Yes (Buyer) |
| PUT | `/api/service-requests/:id/accept` | Accept request | Yes (Seller) |
| PUT | `/api/service-requests/:id/status` | Update status | Yes |
| DELETE | `/api/service-requests/:id` | Delete request | Yes |
| GET | `/api/service-requests/nearby` | Get nearby requests | No |

### Seller Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sellers` | Get all sellers | No |
| GET | `/api/sellers/:id` | Get seller by ID | No |
| POST | `/api/sellers/profile` | Create seller profile | Yes (Seller) |
| PUT | `/api/sellers/profile` | Update profile | Yes (Seller) |
| GET | `/api/sellers/category/:category` | Get sellers by category | No |
| GET | `/api/sellers/nearby` | Get nearby sellers | No |
| POST | `/api/sellers/portfolio` | Upload portfolio | Yes (Seller) |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | Get all users | Yes (Admin) |
| PUT | `/api/admin/users/:id/block` | Block user | Yes (Admin) |
| PUT | `/api/admin/users/:id/unblock` | Unblock user | Yes (Admin) |
| PUT | `/api/admin/users/:id/role` | Update user role | Yes (Admin) |
| GET | `/api/admin/sellers/pending` | Get pending sellers | Yes (Admin) |
| PUT | `/api/admin/sellers/:id/approve` | Approve seller | Yes (Admin) |
| GET | `/api/admin/analytics` | Get analytics | Yes (Admin) |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Access Token**: Short-lived (15 minutes) for API requests
2. **Refresh Token**: Long-lived (7 days) for getting new access tokens

### Usage Example

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, refreshToken } = await response.json();

// Use access token for authenticated requests
const userResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## 🗄 Database Models

### User Model
```typescript
{
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'admin';
  status: 'active' | 'blocked' | 'pending';
  emailVerified: boolean;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceRequest Model
```typescript
{
  buyerId: ObjectId;
  sellerId?: ObjectId;
  category: string;
  type: 'instant' | 'scheduled';
  description: string;
  price: number;
  location: {
    address: string;
    coordinates: [number, number];
  };
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

### SellerProfile Model
```typescript
{
  userId: ObjectId;
  bio: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  serviceCategories: string[];
  yearsOfExperience: number;
  rating: number;
  reviewsCount: number;
  availability: boolean;
  portfolio: string[];
  isApproved: boolean;
}
```

## 🧪 Testing

Run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t services-hub-backend .
   ```

2. **Run container**
   ```bash
   docker run -p 3001:3001 --env-file .env services-hub-backend
   ```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start with PM2**
   ```bash
   pm2 start dist/server.js --name "services-hub-api"
   ```

3. **Environment setup**
   - Set up MongoDB Atlas
   - Configure environment variables
   - Set up Redis for caching
   - Configure SSL certificates

## 📊 Monitoring

- **Health Check**: `GET /health`
- **System Health**: `GET /api/admin/system-health`
- **Analytics**: `GET /api/admin/analytics`

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Comprehensive request validation
- **Password Hashing**: bcrypt with 12 rounds
- **JWT Security**: Secure token handling with rotation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@serviceshub.com or create an issue in the repository.

---

**Built with ❤️ for Services Hub**
