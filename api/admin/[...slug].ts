import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, parseBody, extractUser, rateLimit, withDatabase } from './_utils/db';
import { requireAuth, requireAdmin, validateBody, handleError, sendSuccess, paginate } from './_middleware';
import { User } from '../backend/src/models/User';
import { SellerProfile } from '../backend/src/models/SellerProfile';

// Get all users (admin only)
export const getUsers = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication and admin role
  if (!requireAuth(req, res)) return;
  if (!requireAdmin(req, res)) return;
  
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    
    // Build query
    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Paginate results
    const paginatedResults = paginate(users, Number(page), Number(limit));
    
    sendSuccess(res, paginatedResults, 'Users retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Get pending sellers (admin only)
export const getPendingSellers = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication and admin role
  if (!requireAuth(req, res)) return;
  if (!requireAdmin(req, res)) return;
  
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get pending sellers
    const sellers = await SellerProfile.find({ isApproved: false })
      .populate('userId', 'name email phone avatar')
      .sort({ createdAt: -1 });
    
    // Paginate results
    const paginatedResults = paginate(sellers, Number(page), Number(limit));
    
    sendSuccess(res, paginatedResults, 'Pending sellers retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Approve seller (admin only)
export const approveSeller = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication and admin role
  if (!requireAuth(req, res)) return;
  if (!requireAdmin(req, res)) return;
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required',
        code: 'MISSING_ID'
      });
    }
    
    const sellerProfile = await SellerProfile.findById(id);
    if (!sellerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found',
        code: 'SELLER_NOT_FOUND'
      });
    }
    
    // Approve seller
    sellerProfile.isApproved = true;
    await sellerProfile.save();
    
    // Populate user data
    await sellerProfile.populate('userId', 'name email phone avatar');
    
    sendSuccess(res, sellerProfile, 'Seller approved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Get analytics (admin only)
export const getAnalytics = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication and admin role
  if (!requireAuth(req, res)) return;
  if (!requireAdmin(req, res)) return;
  
  try {
    // Basic analytics - in a real app, this would be more comprehensive
    const analytics = {
      totalUsers: await User.countDocuments(),
      totalSellers: await SellerProfile.countDocuments({ isApproved: true }),
      pendingSellers: await SellerProfile.countDocuments({ isApproved: false }),
      totalRequests: 0, // Would query ServiceRequest collection
      completedRequests: 0,
      totalRevenue: 0
    };
    
    sendSuccess(res, analytics, 'Analytics retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Main handler for admin routes
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const route = Array.isArray(slug) ? slug[0] : slug;
  
  switch (route) {
    case 'users':
      return getUsers(req, res);
    case 'sellers':
      return getPendingSellers(req, res);
    case 'analytics':
      return getAnalytics(req, res);
    case 'approve':
      return approveSeller(req, res);
    default:
      return res.status(404).json({
        success: false,
        message: 'Admin endpoint not found',
        code: 'NOT_FOUND'
      });
  }
}
