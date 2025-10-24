# Services Hub - Troubleshooting Guide

This guide helps you diagnose and fix common issues with Services Hub deployment and operation.

## Quick Diagnosis

### Health Check Commands

```bash
# Check if the API is responding
curl https://your-app.vercel.app/api/health

# Check deployment status
vercel ls

# Check function logs
vercel logs https://your-app.vercel.app
```

## Common Deployment Issues

### Build Failures

#### TypeScript Compilation Errors
**Symptoms**: Build fails with TypeScript errors
**Solutions**:
```bash
# Check TypeScript compilation locally
npm run type-check

# Check for missing dependencies
npm install

# Clear build cache
rm -rf dist node_modules/.vite
npm run build
```

#### Missing Dependencies
**Symptoms**: Module not found errors
**Solutions**:
```bash
# Install all dependencies
npm install
cd backend && npm install

# Check package.json for missing packages
npm ls --depth=0
```

#### Environment Variable Issues
**Symptoms**: Build succeeds but runtime errors
**Solutions**:
```bash
# Check environment variables in Vercel
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME

# Verify variable values
vercel env pull .env.local
```

### Database Connection Issues

#### MongoDB Atlas Connection Failed
**Symptoms**: API returns 500 errors, database connection logs show failures
**Solutions**:

1. **Check MongoDB Atlas Status**:
   - Verify cluster is running
   - Check if cluster is paused (free tier pauses after inactivity)

2. **Verify Connection String**:
   ```bash
   # Test connection string format
   mongodb+srv://username:password@cluster.mongodb.net/services-hub
   ```

3. **Check Network Access**:
   - Ensure IP whitelist includes 0.0.0.0/0
   - Verify no firewall blocking connections

4. **Verify Credentials**:
   - Check username/password are correct
   - Ensure user has read/write permissions

5. **Test Connection Locally**:
   ```bash
   # Test with MongoDB Compass or CLI
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/services-hub"
   ```

#### Database Seeding Issues
**Symptoms**: Admin user not created, seeding script fails
**Solutions**:
```bash
# Run seeding with verbose output
cd backend
MONGODB_URI=your-uri npm run deploy:seed

# Check if admin user exists
# Connect to MongoDB and verify:
db.users.findOne({role: "admin"})
```

### Authentication Issues

#### JWT Token Errors
**Symptoms**: 401 Unauthorized errors, token validation failures
**Solutions**:

1. **Check JWT Secrets**:
   ```bash
   # Verify secrets are set
   vercel env ls | grep JWT
   
   # Ensure secrets are 32+ characters
   echo $JWT_SECRET | wc -c
   ```

2. **Check Token Expiration**:
   - Verify JWT_EXPIRES_IN is reasonable (15m)
   - Check JWT_REFRESH_EXPIRES_IN (7d)

3. **Test Token Generation**:
   ```bash
   # Test login endpoint
   curl -X POST https://your-app.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

#### CORS Errors
**Symptoms**: Browser console shows CORS errors, API calls blocked
**Solutions**:

1. **Check CORS_ORIGIN**:
   ```bash
   # Verify CORS origin matches your domain
   vercel env get CORS_ORIGIN
   ```

2. **Update CORS Configuration**:
   ```bash
   # Set correct origin
   vercel env add CORS_ORIGIN
   # Enter: https://your-app.vercel.app
   ```

3. **Check API Client Configuration**:
   ```typescript
   // Verify baseURL in src/api/client.ts
   baseURL: '/api'  // Should be relative for Vercel
   ```

### Performance Issues

#### Slow API Responses
**Symptoms**: API calls take >5 seconds, timeouts
**Solutions**:

1. **Check Function Logs**:
   ```bash
   vercel logs --follow
   ```

2. **Optimize Database Queries**:
   - Add indexes for common queries
   - Use connection pooling
   - Implement caching

3. **Check Cold Starts**:
   - Monitor function execution time
   - Consider keeping functions warm
   - Optimize imports and dependencies

#### Frontend Loading Issues
**Symptoms**: Slow page loads, bundle size warnings
**Solutions**:

1. **Check Bundle Size**:
   ```bash
   npm run build
   # Check dist folder size
   ```

2. **Enable Code Splitting**:
   ```typescript
   // Use React.lazy for route components
   const LazyComponent = React.lazy(() => import('./Component'));
   ```

3. **Optimize Images**:
   - Compress images
   - Use WebP format
   - Implement lazy loading

### Function-Specific Issues

#### Serverless Function Timeouts
**Symptoms**: Functions timeout after 30 seconds
**Solutions**:

1. **Check Function Duration**:
   ```bash
   # Monitor function execution time
   vercel logs | grep "Duration"
   ```

2. **Optimize Database Operations**:
   - Use connection pooling
   - Implement query optimization
   - Add proper indexing

3. **Increase Timeout** (if needed):
   ```json
   // In vercel.json
   "functions": {
     "api/**/*.ts": {
       "maxDuration": 60
     }
   }
   ```

#### Memory Issues
**Symptoms**: Functions run out of memory
**Solutions**:

1. **Check Memory Usage**:
   ```bash
   vercel logs | grep "Memory"
   ```

2. **Increase Memory Allocation**:
   ```json
   // In vercel.json
   "functions": {
     "api/**/*.ts": {
       "memory": 2048
     }
   }
   ```

3. **Optimize Code**:
   - Remove unused imports
   - Implement lazy loading
   - Use streaming for large data

## Environment-Specific Issues

### Development Environment

#### Local Development Issues
**Symptoms**: App doesn't work locally
**Solutions**:

1. **Check Environment Variables**:
   ```bash
   # Copy example file
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

2. **Start Development Servers**:
   ```bash
   # Frontend
   npm run dev
   
   # Backend (if running locally)
   cd backend && npm run dev
   ```

3. **Check Port Conflicts**:
   ```bash
   # Check if ports are in use
   lsof -i :5173  # Frontend
   lsof -i :3001  # Backend
   ```

### Production Environment

#### Vercel-Specific Issues
**Symptoms**: Deployment works but app doesn't function
**Solutions**:

1. **Check Build Logs**:
   ```bash
   vercel logs --build
   ```

2. **Verify Environment Variables**:
   ```bash
   vercel env ls
   ```

3. **Check Function Logs**:
   ```bash
   vercel logs --follow
   ```

## Debugging Tools

### Logging and Monitoring

#### Enable Debug Logging
```bash
# Set debug environment variable
vercel env add DEBUG
# Enter: services-hub:*

# Check logs
vercel logs --follow
```

#### Use Browser DevTools
1. Open browser DevTools (F12)
2. Check Console for errors
3. Monitor Network tab for failed requests
4. Check Application tab for localStorage issues

#### Database Debugging
```bash
# Connect to MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/services-hub"

# Check collections
show collections

# Check user data
db.users.find().limit(5)

# Check service requests
db.servicerequests.find().limit(5)
```

### Testing Commands

#### API Testing
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test authentication
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@serviceshub.com","password":"Admin123!"}'

# Test service requests (with auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.vercel.app/api/service-requests/user
```

#### Frontend Testing
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test
npm run test:integration
npm run test:e2e
```

## Recovery Procedures

### Database Recovery

#### Restore from Backup
```bash
# If using MongoDB Atlas backups
# 1. Go to MongoDB Atlas dashboard
# 2. Navigate to "Backups"
# 3. Select restore point
# 4. Restore to new cluster or current cluster
```

#### Re-seed Database
```bash
# Clear existing data and re-seed
cd backend
MONGODB_URI=your-uri npm run db:reset
MONGODB_URI=your-uri npm run deploy:seed
```

### Deployment Recovery

#### Rollback to Previous Version
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

#### Emergency Fix Deployment
```bash
# Make quick fix and deploy
git add .
git commit -m "Emergency fix"
vercel --prod
```

## Getting Help

### Self-Service Resources

1. **Check Logs First**:
   ```bash
   vercel logs --follow
   ```

2. **Run Diagnostic Scripts**:
   ```bash
   node scripts/pre-deploy-check.js
   ./scripts/verify-deployment.sh https://your-app.vercel.app
   ```

3. **Review Documentation**:
   - [Vercel Documentation](https://vercel.com/docs)
   - [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
   - [React Documentation](https://reactjs.org/docs)

### When to Contact Support

Contact support if you encounter:
- Persistent build failures after following troubleshooting steps
- Database corruption or data loss
- Security vulnerabilities
- Performance issues that can't be resolved
- Integration failures with third-party services

### Support Information

When contacting support, provide:
- Error messages and logs
- Steps to reproduce the issue
- Environment details (Node.js version, OS, etc.)
- Deployment URL
- Screenshots or screen recordings

---

## Prevention Tips

### Regular Maintenance

1. **Monitor Error Logs Daily**
2. **Update Dependencies Monthly**
3. **Review Security Advisories**
4. **Test Deployments in Preview First**
5. **Keep Backups Current**
6. **Monitor Performance Metrics**

### Best Practices

1. **Use Environment Variables for All Secrets**
2. **Implement Proper Error Handling**
3. **Add Comprehensive Logging**
4. **Test All User Flows Before Deployment**
5. **Keep Documentation Updated**
6. **Use TypeScript Strict Mode**

---

**Last Updated**: [Current Date]  
**Version**: 1.0.0
