import { Request, Response, NextFunction } from 'express';
import { SellerProfile, createSellerProfile, updateSellerProfile, getSellerProfileByUserId } from '../models/SellerProfile';
import { sendSuccessResponse, sendPaginatedResponse } from '../middleware/errorHandler';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { IAuthenticatedRequest } from '../types';
import { uploadImageFromBuffer, deleteImage, extractPublicId } from '../services/cloudinaryService';

// Get all sellers
export const getSellers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10, category, rating, availability } = req.query;

  let query: any = { isApproved: true };
  
  if (category) {
    query.serviceCategories = category;
  }
  
  if (rating) {
    query.rating = { $gte: Number(rating) };
  }
  
  if (availability !== undefined) {
    query.availability = availability === 'true';
  }

  const sellers = await SellerProfile.find(query)
    .populate('userId', 'name email phone avatar')
    .sort({ rating: -1, reviewsCount: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await SellerProfile.countDocuments(query);
  const pages = Math.ceil(total / Number(limit));

  sendPaginatedResponse(res, sellers, {
    page: Number(page),
    limit: Number(limit),
    total,
    pages
  }, 'Sellers retrieved successfully');
});

// Get seller by ID
export const getSellerById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const seller = await SellerProfile.findById(id)
    .populate('userId', 'name email phone avatar')
    .populate('approvedBy', 'name email');

  if (!seller) {
    return next(new AppError('Seller not found', 404, 'SELLER_NOT_FOUND'));
  }

  sendSuccessResponse(res, seller, 'Seller retrieved successfully');
});

// Create seller profile
export const createProfile = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { bio, location, serviceCategories, yearsOfExperience, certifications, profilePicture, portfolio } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Check if user is a seller
  if (req.user.role !== 'seller') {
    return next(new AppError('Only sellers can create profiles', 403, 'INVALID_ROLE'));
  }

  // Check if profile already exists
  const existingProfile = await getSellerProfileByUserId(req.user._id);
  if (existingProfile) {
    return next(new AppError('Seller profile already exists', 400, 'PROFILE_EXISTS'));
  }

  const profileData = {
    userId: req.user._id,
    bio,
    location,
    serviceCategories,
    yearsOfExperience,
    certifications: certifications || [],
    profilePicture,
    portfolio: portfolio || []
  };

  const sellerProfile = await createSellerProfile(profileData);

  sendSuccessResponse(res, sellerProfile, 'Seller profile created successfully', 201);
});

// Update seller profile
export const updateProfile = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { bio, location, serviceCategories, yearsOfExperience, certifications, availability, profilePicture, portfolio } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const updateData: any = {};
  
  if (bio !== undefined) updateData.bio = bio;
  if (location !== undefined) updateData.location = location;
  if (serviceCategories !== undefined) updateData.serviceCategories = serviceCategories;
  if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
  if (certifications !== undefined) updateData.certifications = certifications;
  if (availability !== undefined) updateData.availability = availability;
  if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
  if (portfolio !== undefined) updateData.portfolio = portfolio;

  const updatedProfile = await updateSellerProfile(req.user._id, updateData);
  
  if (!updatedProfile) {
    return next(new AppError('Seller profile not found', 404, 'PROFILE_NOT_FOUND'));
  }

  sendSuccessResponse(res, updatedProfile, 'Seller profile updated successfully');
});

// Get sellers by category
export const getSellersByCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { category } = req.params;
  const { page = 1, limit = 10, rating, availability } = req.query;

  let query: any = { 
    serviceCategories: category,
    isApproved: true
  };
  
  if (rating) {
    query.rating = { $gte: Number(rating) };
  }
  
  if (availability !== undefined) {
    query.availability = availability === 'true';
  }

  const sellers = await SellerProfile.find(query)
    .populate('userId', 'name email phone avatar')
    .sort({ rating: -1, reviewsCount: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await SellerProfile.countDocuments(query);
  const pages = Math.ceil(total / Number(limit));

  sendPaginatedResponse(res, sellers, {
    page: Number(page),
    limit: Number(limit),
    total,
    pages
  }, 'Sellers by category retrieved successfully');
});

// Get nearby sellers
export const getNearbySellers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { lat, lng, radius = 50, category, page = 1, limit = 10 } = req.query;

  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude are required', 400, 'COORDINATES_REQUIRED'));
  }

  const coordinates: [number, number] = [Number(lng), Number(lat)];
  const sellers = await SellerProfile.findNearby(coordinates, Number(radius));
  
  // Filter by category if provided
  let filteredSellers = sellers;
  if (category) {
    filteredSellers = sellers.filter(seller => 
      seller.serviceCategories.includes(category as string)
    );
  }

  const total = filteredSellers.length;
  const pages = Math.ceil(total / Number(limit));
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedSellers = filteredSellers.slice(skip, skip + Number(limit));

  sendPaginatedResponse(res, paginatedSellers, {
    page: Number(page),
    limit: Number(limit),
    total,
    pages
  }, 'Nearby sellers retrieved successfully');
});

// Upload portfolio images
export const uploadPortfolio = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Check if files were uploaded
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return next(new AppError('No files uploaded', 400, 'NO_FILES_UPLOADED'));
  }

  const sellerProfile = await getSellerProfileByUserId(req.user._id);
  if (!sellerProfile) {
    return next(new AppError('Seller profile not found', 404, 'PROFILE_NOT_FOUND'));
  }

  // Upload images to Cloudinary
  const uploadPromises = req.files.map((file: any) => 
    uploadImageFromBuffer(file.buffer, {
      folder: 'portfolio',
      maxWidth: 1200,
      maxHeight: 800,
      quality: 'auto',
      format: 'auto'
    })
  );
  
  const uploadResults = await Promise.all(uploadPromises);
  const newImageUrls = uploadResults.map(result => result.secure_url);
  
  sellerProfile.portfolio = [...sellerProfile.portfolio, ...newImageUrls];
  await sellerProfile.save();

  sendSuccessResponse(res, { portfolio: sellerProfile.portfolio }, 'Portfolio images uploaded successfully');
});

// Get seller profile by user ID
export const getSellerProfile = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const sellerProfile = await getSellerProfileByUserId(req.user._id);
  if (!sellerProfile) {
    return next(new AppError('Seller profile not found', 404, 'PROFILE_NOT_FOUND'));
  }

  sendSuccessResponse(res, sellerProfile, 'Seller profile retrieved successfully');
});

// Get top-rated sellers
export const getTopRatedSellers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 10, category } = req.query;

  let sellers;
  if (category) {
    sellers = await SellerProfile.findByCategory(category as string);
  } else {
    sellers = await SellerProfile.findTopRated(Number(limit));
  }

  sendSuccessResponse(res, sellers, 'Top-rated sellers retrieved successfully');
});

// Update seller availability
export const updateAvailability = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { availability } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const sellerProfile = await updateSellerProfile(req.user._id, { availability });
  if (!sellerProfile) {
    return next(new AppError('Seller profile not found', 404, 'PROFILE_NOT_FOUND'));
  }

  sendSuccessResponse(res, sellerProfile, 'Availability updated successfully');
});

// Get seller statistics
export const getSellerStats = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const sellerProfile = await getSellerProfileByUserId(req.user._id);
  if (!sellerProfile) {
    return next(new AppError('Seller profile not found', 404, 'PROFILE_NOT_FOUND'));
  }

  // Get additional statistics
  const ServiceRequest = require('../models/ServiceRequest').default;
  const Transaction = require('../models/Transaction').default;

  const [totalRequests, completedRequests, totalEarnings, recentReviews] = await Promise.all([
    ServiceRequest.countDocuments({ sellerId: req.user._id }),
    ServiceRequest.countDocuments({ sellerId: req.user._id, status: 'completed' }),
    Transaction.aggregate([
      { $match: { sellerId: req.user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    // Get recent reviews (implement review system later)
    Promise.resolve([])
  ]);

  const stats = {
    profile: sellerProfile,
    totalRequests,
    completedRequests,
    totalEarnings: totalEarnings[0]?.total || 0,
    completionRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0,
    recentReviews
  };

  sendSuccessResponse(res, stats, 'Seller statistics retrieved successfully');
});

export default {
  getSellers,
  getSellerById,
  createProfile,
  updateProfile,
  getSellersByCategory,
  getNearbySellers,
  uploadPortfolio,
  getSellerProfile,
  getTopRatedSellers,
  updateAvailability,
  getSellerStats
};
