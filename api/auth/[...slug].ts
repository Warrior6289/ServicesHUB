import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, parseBody, extractUser, rateLimit, withDatabase } from './_utils/db';
import { requireAuth, validateBody, handleError, sendSuccess } from './_middleware';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../backend/src/config/env';
import { User } from '../backend/src/models/User';

// JWT helper functions
const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  
  const refreshToken = jwt.sign(
    { userId: user._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
  
  return { accessToken, refreshToken };
};

// Register endpoint
export const register = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Rate limiting
  if (!rateLimit(10, 900000)(req, res)) return;
  
  try {
    const { name, email, password, role = 'buyer', phone } = parseBody(req);
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        code: 'WEAK_PASSWORD'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
        code: 'USER_EXISTS'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.bcrypt?.rounds || 12);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      emailVerified: false,
      status: 'active'
    });
    
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      emailVerified: user.emailVerified,
      status: user.status,
      createdAt: user.createdAt
    };
    
    sendSuccess(res, {
      user: userData,
      accessToken,
      refreshToken
    }, 'User registered successfully', 201);
    
  } catch (error) {
    handleError(error, res);
  }
});

// Login endpoint
export const login = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Rate limiting
  if (!rateLimit(5, 900000)(req, res)) return;
  
  try {
    const { email, password } = parseBody(req);
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
        code: 'ACCOUNT_INACTIVE'
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      emailVerified: user.emailVerified,
      status: user.status,
      createdAt: user.createdAt
    };
    
    sendSuccess(res, {
      user: userData,
      accessToken,
      refreshToken
    }, 'Login successful');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Refresh token endpoint
export const refreshToken = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  try {
    const { refreshToken } = parseBody(req);
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    sendSuccess(res, {
      accessToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    handleError(error, res);
  }
});

// Get current user endpoint
export const getCurrentUser = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication
  if (!requireAuth(req, res)) return;
  
  try {
    const user = extractUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Find user in database
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Return user data (without password)
    const userData = {
      _id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      phone: dbUser.phone,
      emailVerified: dbUser.emailVerified,
      status: dbUser.status,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };
    
    sendSuccess(res, userData, 'User retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Logout endpoint
export const logout = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  try {
    // In a real implementation, you would invalidate the refresh token
    // For now, we'll just return success
    sendSuccess(res, null, 'Logout successful');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Main handler for auth routes
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const route = Array.isArray(slug) ? slug[0] : slug;
  
  switch (route) {
    case 'register':
      return register(req, res);
    case 'login':
      return login(req, res);
    case 'refresh':
      return refreshToken(req, res);
    case 'me':
      return getCurrentUser(req, res);
    case 'logout':
      return logout(req, res);
    default:
      return res.status(404).json({
        success: false,
        message: 'Auth endpoint not found',
        code: 'NOT_FOUND'
      });
  }
}
