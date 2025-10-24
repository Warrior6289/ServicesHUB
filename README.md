# Services Hub - Full-Stack Marketplace Platform

A comprehensive marketplace platform connecting service providers with customers, built with React, Node.js, and deployed on Vercel with serverless functions.

## 🚀 Features

### Core Functionality
- **Service Request System**: Instant and scheduled service requests
- **Location-Based Matching**: Find nearby service providers
- **Price Boosting**: Increase visibility for urgent requests
- **Real-Time Updates**: Live status tracking and notifications
- **Multi-Role Support**: Buyers, sellers, and admin users

### User Management
- **Authentication**: JWT-based auth with refresh tokens
- **Role-Based Access**: Buyer, seller, and admin roles
- **Profile Management**: Complete user profiles with verification
- **Seller Profiles**: Detailed seller information and ratings

### Service Categories
- Plumbing, Electrical, Cleaning, HVAC, Landscaping, and more
- Custom service categories support
- Category-based filtering and search

## 🛠 Tech Stack

### Frontend
- **React 18.3** with TypeScript 5.9
- **Vite 5.4** for build tooling
- **Tailwind CSS 3.4** for styling
- **Framer Motion 11.11** for animations
- **React Router DOM 6.27** for routing
- **React Hook Form 7.53** with Zod validation
- **React Leaflet 5.0** for maps
- **Recharts 2.13** for analytics

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Winston** for logging
- **Swagger** for API documentation
- **Sentry** for error monitoring

### Deployment
- **Vercel** for serverless functions
- **MongoDB Atlas** for database
- **Cloudinary** for image storage (optional)
- **Stripe** for payments (optional)

## 📁 Project Structure

```
services-hub/
├── api/                          # Vercel serverless functions
│   ├── auth/[...slug].ts         # Authentication endpoints
│   ├── users/[...slug].ts       # User management
│   ├── service-requests/[...slug].ts # Service requests
│   ├── sellers/[...slug].ts     # Seller management
│   ├── admin/[...slug].ts       # Admin operations
│   ├── _utils/db.ts            # Database utilities
│   └── _middleware.ts          # Shared middleware
├── backend/                      # Backend source code
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── controllers/        # Route controllers
│   │   ├── models/            # Database models
│   │   ├── routes/            # Express routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── scripts/           # Database scripts
│   └── tests/                 # Backend tests
├── src/                        # Frontend source code
│   ├── components/            # React components
│   ├── pages/                # Page components
│   ├── api/                  # API client
│   ├── lib/                  # Utilities and config
│   ├── hooks/                # Custom hooks
│   └── types/                # TypeScript types
└── public/                    # Static assets
```

## 🚀 Quick Deployment to Vercel

### Prerequisites
- MongoDB Atlas account
- Vercel account
- Git repository

### 1. Generate Production Secrets
```bash
npm run generate:secrets
```

### 2. Set Up MongoDB Atlas
1. Create free M0 cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Configure network access (0.0.0.0/0)
3. Create database user
4. Get connection string

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
# ... (see DEPLOYMENT.md for complete list)

# Deploy
vercel --prod
```

### 4. Seed Database
```bash
cd backend
MONGODB_URI=your-production-uri npm run deploy:seed
```

### 5. Verify Deployment
```bash
./scripts/verify-deployment.sh https://your-app.vercel.app
```

📖 **For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## 📋 Environment Variables Reference

### Required for Production
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/services-hub` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-32-character-secret-key` |
| `JWT_REFRESH_SECRET` | JWT refresh secret (32+ chars) | `your-32-character-refresh-secret` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://your-app.vercel.app` |
| `ADMIN_API_KEY` | Admin API access key | `your-admin-key` |
| `SESSION_SECRET` | Session secret (32+ chars) | `your-32-character-session-secret` |

### Optional Services
| Variable | Description | Required For |
|----------|-------------|--------------|
| `EMAIL_USER` | Email service username | Email notifications |
| `EMAIL_PASS` | Email service password | Email notifications |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Image uploads |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Image uploads |
| `STRIPE_SECRET_KEY` | Stripe secret key | Payment processing |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Payment processing |
| `SENTRY_DSN` | Sentry error monitoring DSN | Error tracking |

📖 **For complete setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## 🚀 Deployment to Vercel

### 1. Prerequisites
- Vercel account
- MongoDB Atlas account
- GitHub repository

### 2. Environment Variables

Set these environment variables in Vercel:

#### Required Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/services-hub
JWT_SECRET=your-production-jwt-secret-32-chars-minimum
JWT_REFRESH_SECRET=your-production-refresh-secret-32-chars-minimum
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.vercel.app
ADMIN_API_KEY=your-production-admin-key
BCRYPT_ROUNDS=12
SESSION_SECRET=your-production-session-secret
```

#### Optional Variables
```
SENTRY_DSN=your-sentry-dsn
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Set environment variables in Vercel dashboard
4. Deploy

### 4. Database Setup
```bash
# Seed production database
cd backend
MONGODB_URI=your-production-mongodb-uri npm run db:seed
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Tests
```bash
npm test                   # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### E2E Tests
```bash
npm run test:e2e          # Run E2E tests
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Service Request Endpoints
- `POST /api/service-requests/instant` - Create instant request
- `POST /api/service-requests/scheduled` - Create scheduled request
- `GET /api/service-requests/user` - Get user's requests
- `GET /api/service-requests/seller` - Get seller's requests
- `GET /api/service-requests/nearby` - Get nearby requests
- `PATCH /api/service-requests/boost` - Boost request price
- `PATCH /api/service-requests/accept` - Accept request

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

### Seller Endpoints
- `GET /api/sellers` - Get all sellers
- `GET /api/sellers/:id` - Get seller by ID
- `GET /api/sellers/profile` - Get seller profile
- `POST /api/sellers/create` - Create seller profile
- `PUT /api/sellers/update` - Update seller profile

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/sellers` - Get pending sellers
- `PATCH /api/admin/approve` - Approve seller
- `GET /api/admin/analytics` - Get analytics

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run tests
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

#### Backend
```bash
npm run dev              # Start development server
npm run build            # Build TypeScript
npm run start            # Start production server
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run db:seed          # Seed database
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database
```

### Code Quality
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **TypeScript**: Strict type checking

### Error Handling
- **Sentry**: Error monitoring and tracking
- **Winston**: Structured logging
- **Error Boundaries**: React error boundaries
- **API Error Handling**: Standardized error responses

## 🔒 Security

### Authentication
- JWT tokens with refresh mechanism
- Password hashing with bcrypt
- Role-based access control
- Rate limiting on sensitive endpoints

### Data Protection
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- Environment variable protection

### Best Practices
- No sensitive data in client-side code
- Secure token storage
- Regular dependency updates
- Security headers and CSP

## 📊 Monitoring

### Error Tracking
- Sentry integration for error monitoring
- Winston logging for server-side logs
- Error boundaries for client-side errors

### Analytics
- User interaction tracking
- Performance monitoring
- API usage analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the existing code style
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

#### Database Connection Issues
- Ensure MongoDB is running
- Check connection string format
- Verify network access for Atlas

#### Authentication Issues
- Check JWT secret configuration
- Verify token expiration settings
- Ensure proper CORS configuration

#### Build Issues
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify environment variables

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Create a new issue with detailed information
- Join our community discussions

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core service request system
- ✅ User authentication and roles
- ✅ Basic seller profiles
- ✅ Admin dashboard
- ✅ Vercel deployment

### Phase 2 (Next)
- [ ] Payment integration
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Mobile app
- [ ] Advanced analytics

### Phase 3 (Future)
- [ ] AI-powered matching
- [ ] Video consultations
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Enterprise features

---

**Built with ❤️ by the Services Hub Team**