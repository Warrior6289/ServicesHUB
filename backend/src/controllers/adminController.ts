import { Request, Response, NextFunction } from 'express';
import { User, updateUser } from '../models/User';
import { SellerProfile, updateSellerProfile } from '../models/SellerProfile';
import { ServiceRequest } from '../models/ServiceRequest';
import { Transaction } from '../models/Transaction';
import { sendSuccessResponse, sendPaginatedResponse } from '../middleware/errorHandler';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { IAuthenticatedRequest } from '../types';

// Get all users
export const getUsers = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10, role, status, search } = req.query;

  let query: any = {};
  
  if (role) {
    query.role = role;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await User.countDocuments(query);
  const pages = Math.ceil(total / Number(limit));

  sendPaginatedResponse(res, users, {
    page: Number(page),
    limit: Number(limit),
    total,
    pages
  }, 'Users retrieved successfully');
});

// Block user
export const blockUser = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await updateUser(id, { 
    status: 'blocked',
    // Add reason to user model if needed
  });

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, user.profile, 'User blocked successfully');
});

// Unblock user
export const unblockUser = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const user = await updateUser(id, { status: 'active' });

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, user.profile, 'User unblocked successfully');
});

// Update user role
export const updateUserRole = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['buyer', 'seller', 'admin'].includes(role)) {
    return next(new AppError('Invalid role', 400, 'INVALID_ROLE'));
  }

  const user = await updateUser(id, { role });

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, user.profile, 'User role updated successfully');
});

// Get pending sellers
export const getPendingSellers = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10 } = req.query;

  const sellers = await SellerProfile.find({ isApproved: false })
    .populate('userId', 'name email phone avatar')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await SellerProfile.countDocuments({ isApproved: false });
  const pages = Math.ceil(total / Number(limit));

  sendPaginatedResponse(res, sellers, {
    page: Number(page),
    limit: Number(limit),
    total,
    pages
  }, 'Pending sellers retrieved successfully');
});

// Approve seller
export const approveSeller = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const seller = await SellerProfile.findByIdAndUpdate(
    id,
    { 
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: req.user._id
    },
    { new: true }
  ).populate('userId', 'name email phone avatar');

  if (!seller) {
    return next(new AppError('Seller not found', 404, 'SELLER_NOT_FOUND'));
  }

  sendSuccessResponse(res, seller, 'Seller approved successfully');
});

// Reject seller
export const rejectSeller = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { reason } = req.body;

  const seller = await SellerProfile.findByIdAndDelete(id);
  
  if (!seller) {
    return next(new AppError('Seller not found', 404, 'SELLER_NOT_FOUND'));
  }

  // Send rejection email (implement later)
  // await sendSellerRejectionEmail(seller.userId, reason);

  sendSuccessResponse(res, null, 'Seller rejected successfully');
});

// Get analytics
export const getAnalytics = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { period = '30d' } = req.query;

  // Calculate date range based on period
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  // Get basic counts
  const [
    totalUsers,
    totalSellers,
    totalBuyers,
    totalAdmins,
    activeUsers,
    blockedUsers,
    pendingUsers,
    totalServiceRequests,
    completedRequests,
    pendingRequests,
    totalTransactions,
    completedTransactions,
    totalRevenue
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'seller' }),
    User.countDocuments({ role: 'buyer' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'blocked' }),
    User.countDocuments({ status: 'pending' }),
    ServiceRequest.countDocuments(),
    ServiceRequest.countDocuments({ status: 'completed' }),
    ServiceRequest.countDocuments({ status: 'pending' }),
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: 'completed' }),
    Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  // Get recent activity
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email role status createdAt');

  const recentServiceRequests = await ServiceRequest.find()
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get category distribution
  const categoryStats = await ServiceRequest.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get user growth over time
  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  const analytics = {
    overview: {
      totalUsers,
      totalSellers,
      totalBuyers,
      totalAdmins,
      activeUsers,
      blockedUsers,
      pendingUsers,
      totalServiceRequests,
      completedRequests,
      pendingRequests,
      totalTransactions,
      completedTransactions,
      totalRevenue: totalRevenue[0]?.total || 0
    },
    recentActivity: {
      recentUsers,
      recentServiceRequests
    },
    categoryStats,
    userGrowth,
    period
  };

  sendSuccessResponse(res, analytics, 'Analytics retrieved successfully');
});

// Get audit logs
export const getAuditLogs = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10, action, userId, startDate, endDate } = req.query;

  // This would typically come from an audit log collection
  // For now, we'll return a placeholder
  const auditLogs = [
    {
      id: '1',
      userId: 'user123',
      action: 'LOGIN',
      resource: 'User',
      resourceId: 'user123',
      details: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' },
      timestamp: new Date()
    }
  ];

  const total = auditLogs.length;
  const pages = Math.ceil(total / Number(limit));
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedLogs = auditLogs.slice(skip, skip + Number(limit));

  sendPaginatedResponse(res, paginatedLogs, {
    page: Number(page),
    limit: Number(limit),
    total,
    pages
  }, 'Audit logs retrieved successfully');
});

// Get system health
export const getSystemHealth = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { getDatabaseStats } = require('../config/database');
  
  const dbStats = await getDatabaseStats();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: dbStats,
    version: process.env.APP_VERSION || '1.0.0'
  };

  sendSuccessResponse(res, health, 'System health retrieved successfully');
});

// Get user by ID
export const getUserById = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-password -refreshTokens');
  
  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, user, 'User retrieved successfully');
});

// Delete user
export const deleteUser = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  
  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, null, 'User deleted successfully');
});

export default {
  getUsers,
  getUserById,
  blockUser,
  unblockUser,
  updateUserRole,
  deleteUser,
  getPendingSellers,
  approveSeller,
  rejectSeller,
  getAnalytics,
  getAuditLogs,
  getSystemHealth
};
