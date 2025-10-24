import { Request, Response, NextFunction } from 'express';
import { User, updateUser, deleteUser } from '../models/User';
import { sendSuccessResponse } from '../middleware/errorHandler';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { IAuthenticatedRequest } from '../types';
import { uploadImageFromBuffer, deleteImage, extractPublicId } from '../services/cloudinaryService';

// Get user profile
export const getProfile = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, req.user.profile, 'Profile retrieved successfully');
});

// Update user profile
export const updateProfile = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name, phone, avatar } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const updatedUser = await updateUser(req.user._id, {
    name,
    phone,
    avatar
  });

  if (!updatedUser) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, updatedUser.profile, 'Profile updated successfully');
});

// Change password
export const changePassword = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD'));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccessResponse(res, null, 'Password changed successfully');
});

// Upload avatar
export const uploadAvatar = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Check if file was uploaded
  if (!req.file) {
    return next(new AppError('No file uploaded', 400, 'NO_FILE_UPLOADED'));
  }

  // Upload to Cloudinary
  const uploadResult = await uploadImageFromBuffer(req.file.buffer, {
    folder: 'avatars',
    maxWidth: 400,
    maxHeight: 400,
    quality: 'auto',
    format: 'auto'
  });

  // Delete old avatar if exists
  if (req.user.avatar) {
    const oldPublicId = extractPublicId(req.user.avatar);
    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }
  }
  
  const updatedUser = await updateUser(req.user._id, { avatar: uploadResult.secure_url });
  
  if (!updatedUser) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, { avatar: updatedUser.avatar }, 'Avatar uploaded successfully');
});

// Delete account
export const deleteAccount = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { password } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Password is incorrect', 400, 'INVALID_PASSWORD'));
  }

  // Delete user
  const deleted = await deleteUser(user._id);
  if (!deleted) {
    return next(new AppError('Failed to delete account', 500, 'DELETE_FAILED'));
  }

  sendSuccessResponse(res, null, 'Account deleted successfully');
});

// Get user statistics
export const getUserStats = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Get user statistics based on role
  let stats = {};

  if (req.user.role === 'seller') {
    // Get seller-specific stats
    const ServiceRequest = require('../models/ServiceRequest').default;
    const Transaction = require('../models/Transaction').default;
    
    const [totalRequests, completedRequests, totalEarnings] = await Promise.all([
      ServiceRequest.countDocuments({ sellerId: req.user._id }),
      ServiceRequest.countDocuments({ sellerId: req.user._id, status: 'completed' }),
      Transaction.aggregate([
        { $match: { sellerId: req.user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    stats = {
      totalRequests,
      completedRequests,
      totalEarnings: totalEarnings[0]?.total || 0,
      completionRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0
    };
  } else if (req.user.role === 'buyer') {
    // Get buyer-specific stats
    const ServiceRequest = require('../models/ServiceRequest').default;
    
    const [totalRequests, completedRequests, activeRequests] = await Promise.all([
      ServiceRequest.countDocuments({ buyerId: req.user._id }),
      ServiceRequest.countDocuments({ buyerId: req.user._id, status: 'completed' }),
      ServiceRequest.countDocuments({ buyerId: req.user._id, status: { $in: ['pending', 'accepted', 'in_progress'] } })
    ]);

    stats = {
      totalRequests,
      completedRequests,
      activeRequests,
      completionRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0
    };
  }

  sendSuccessResponse(res, stats, 'User statistics retrieved successfully');
});

// Get user activity
export const getUserActivity = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Get recent activity based on user role
  let activity = [];

  if (req.user.role === 'seller') {
    const ServiceRequest = require('../models/ServiceRequest').default;
    activity = await ServiceRequest.find({ sellerId: req.user._id })
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
  } else if (req.user.role === 'buyer') {
    const ServiceRequest = require('../models/ServiceRequest').default;
    activity = await ServiceRequest.find({ buyerId: req.user._id })
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
  }

  sendSuccessResponse(res, activity, 'User activity retrieved successfully');
});

// Update user preferences
export const updatePreferences = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { notifications, emailUpdates, smsUpdates } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Update user preferences (extend User model to include preferences)
  const updatedUser = await updateUser(req.user._id, {
    // preferences: { notifications, emailUpdates, smsUpdates }
  });

  if (!updatedUser) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, updatedUser.profile, 'Preferences updated successfully');
});

export default {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
  getUserStats,
  getUserActivity,
  updatePreferences
};
