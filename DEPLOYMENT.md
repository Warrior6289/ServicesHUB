# Services Hub - Deployment Guide

This guide will walk you through deploying Services Hub to Vercel with MongoDB Atlas.

## Prerequisites

- Node.js 18+ and npm 8+
- MongoDB Atlas account
- Vercel account
- Git repository

## Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up for a free account
3. Verify your email address

### 1.2 Create a Cluster

1. Click "Create" to start building a cluster
2. Choose "FREE" tier (M0)
3. Select cloud provider: **AWS** (recommended for Vercel)
4. Choose region closest to your users (e.g., `us-east-1`)
5. Name your cluster: `services-hub-production`
6. Click "Create Cluster"

### 1.3 Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a strong password (save it securely!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 1.4 Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Add a comment: "Vercel deployment"
5. Click "Confirm"

### 1.5 Get Connection String

1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `services-hub`

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/services-hub
```

## Step 2: Generate Production Secrets

Run the secrets generator to create secure keys:

```bash
npm run generate:secrets
```

Copy the generated secrets - you'll need them for Vercel environment variables.

## Step 3: Vercel Project Setup

### 3.1 Install Vercel CLI

```bash
npm i -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
```

### 3.3 Link Your Project

```bash
vercel link
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Choose your account
- Link to existing project? **No**
- Project name: `services-hub`
- Directory: `.` (current directory)

## Step 4: Configure Environment Variables

### 4.1 Set Environment Variables in Vercel

```bash
vercel env add
```

Add these variables one by one:

#### Required Variables
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/services-hub
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app.vercel.app
ADMIN_API_KEY=<generated-secret>
BCRYPT_ROUNDS=12
SESSION_SECRET=<generated-secret>
```

#### Optional Variables (can be added later)
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
SENTRY_DSN=your-sentry-dsn
```

### 4.2 Alternative: Set via Vercel Dashboard

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable with the appropriate environment (Production)

## Step 5: Pre-Deployment Verification

Run the pre-deployment check to ensure everything is ready:

```bash
node scripts/pre-deploy-check.js
```

This will verify:
- All required files exist
- TypeScript compilation works
- Linting passes
- Tests pass
- Build succeeds

## Step 6: Deploy to Vercel

### 6.1 Deploy to Preview

```bash
vercel
```

This creates a preview deployment for testing.

### 6.2 Deploy to Production

```bash
vercel --prod
```

This deploys to your production domain.

## Step 7: Database Seeding

After successful deployment, seed your production database:

```bash
cd backend
MONGODB_URI=your-production-mongodb-uri npm run deploy:seed
```

This creates:
- Admin user with email: `admin@serviceshub.com`
- Default password: `Admin123!`

**⚠️ Important**: Change the admin password after first login!

## Step 8: Verify Deployment

### 8.1 Health Check

Test the health endpoint:
```bash
curl https://your-app.vercel.app/api/health
```

### 8.2 Run Verification Script

```bash
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh https://your-app.vercel.app
```

### 8.3 Manual Testing

Test these critical flows:
1. **User Registration**: Create a new account
2. **User Login**: Sign in with credentials
3. **Service Request**: Create a service request
4. **Seller Dashboard**: Access seller features
5. **Admin Panel**: Access admin functions

## Step 9: Configure Custom Domain (Optional)

### 9.1 Add Domain in Vercel

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 9.2 Update CORS Origin

Update the `CORS_ORIGIN` environment variable:
```bash
vercel env add CORS_ORIGIN
# Enter: https://your-custom-domain.com
```

## Step 10: Set Up Monitoring (Recommended)

### 10.1 Error Monitoring with Sentry

1. Create account at [Sentry.io](https://sentry.io)
2. Create a new project
3. Get your DSN
4. Add to Vercel environment variables:
```bash
vercel env add SENTRY_DSN
# Enter your Sentry DSN
```

### 10.2 Analytics (Optional)

Add Google Analytics or similar:
```bash
vercel env add VITE_ANALYTICS_ID
# Enter your analytics ID
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify MongoDB Atlas cluster is running
- Check network access allows 0.0.0.0/0
- Verify connection string format
- Check username/password are correct

#### Build Failures
- Run `npm run type-check` locally
- Check for TypeScript errors
- Verify all dependencies are installed
- Check Vercel build logs

#### Authentication Issues
- Verify JWT secrets are set correctly
- Check CORS_ORIGIN matches your domain
- Ensure JWT secrets are at least 32 characters

#### API Endpoints Not Working
- Check Vercel function logs
- Verify environment variables are set
- Test health endpoint first
- Check CORS configuration

### Getting Help

1. Check Vercel function logs in dashboard
2. Run local tests: `npm run test:all`
3. Test locally: `npm run dev`
4. Check MongoDB Atlas logs
5. Review this troubleshooting guide

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | Set to `production` |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (32+ chars) |
| `JWT_REFRESH_SECRET` | ✅ | JWT refresh secret (32+ chars) |
| `CORS_ORIGIN` | ✅ | Your Vercel app URL |
| `ADMIN_API_KEY` | ✅ | Admin API key |
| `SESSION_SECRET` | ✅ | Session secret (32+ chars) |
| `EMAIL_USER` | ❌ | Email service username |
| `EMAIL_PASS` | ❌ | Email service password |
| `CLOUDINARY_CLOUD_NAME` | ❌ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ❌ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ❌ | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | ❌ | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | ❌ | Stripe publishable key |
| `SENTRY_DSN` | ❌ | Sentry error monitoring DSN |

## Security Checklist

- [ ] MongoDB Atlas cluster secured with strong password
- [ ] Network access restricted to necessary IPs
- [ ] JWT secrets are cryptographically secure (32+ chars)
- [ ] Admin password changed from default
- [ ] CORS origin set to your domain only
- [ ] Environment variables not exposed in client code
- [ ] Rate limiting enabled
- [ ] Error monitoring configured
- [ ] HTTPS enforced (automatic with Vercel)

## Performance Optimization

- [ ] Database indexes created for common queries
- [ ] Images optimized and served via CDN
- [ ] API responses cached where appropriate
- [ ] Bundle size optimized
- [ ] Lazy loading implemented for routes
- [ ] Database connection pooling configured

## Maintenance

### Regular Tasks
- Monitor error logs
- Update dependencies monthly
- Review security advisories
- Backup database regularly
- Monitor performance metrics

### Scaling Considerations
- Upgrade MongoDB Atlas tier as needed
- Consider Redis for caching
- Implement database sharding if needed
- Add CDN for static assets
- Consider microservices architecture

---

**Need Help?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md) or create an issue in the repository.
