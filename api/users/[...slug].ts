import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, parseBody, extractUser, rateLimit, withDatabase } from './_utils/db';
import { requireAuth, validateBody, handleError, sendSuccess, paginate } from './_middleware';
import { User } from '../backend/src/models/User';

// Get user profile
export const getProfile = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
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
      avatar: dbUser.avatar,
      emailVerified: dbUser.emailVerified,
      status: dbUser.status,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };
    
    sendSuccess(res, userData, 'User profile retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Update user profile
export const updateProfile = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication
  if (!requireAuth(req, res)) return;
  
  try {
    const user = extractUser(req);
    const { name, phone, avatar } = parseBody(req);
    
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Update fields
    if (name) dbUser.name = name;
    if (phone !== undefined) dbUser.phone = phone;
    if (avatar !== undefined) dbUser.avatar = avatar;
    
    await dbUser.save();
    
    // Return updated user data (without password)
    const userData = {
      _id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      phone: dbUser.phone,
      avatar: dbUser.avatar,
      emailVerified: dbUser.emailVerified,
      status: dbUser.status,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };
    
    sendSuccess(res, userData, 'Profile updated successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Get user stats
export const getStats = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
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
    
    // This would typically involve more complex queries
    // For now, return basic stats
    const stats = {
      totalRequests: 0,
      completedRequests: 0,
      pendingRequests: 0,
      totalSpent: 0,
      joinDate: new Date().toISOString()
    };
    
    sendSuccess(res, stats, 'User stats retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Main handler for user routes
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const route = Array.isArray(slug) ? slug[0] : slug;
  
  switch (route) {
    case 'profile':
      return getProfile(req, res);
    case 'stats':
      return getStats(req, res);
    default:
      return res.status(404).json({
        success: false,
        message: 'User endpoint not found',
        code: 'NOT_FOUND'
      });
  }
}
