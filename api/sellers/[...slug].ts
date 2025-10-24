import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, parseBody, extractUser, rateLimit, withDatabase } from './_utils/db';
import { requireAuth, requireSeller, validateBody, handleError, sendSuccess, paginate } from './_middleware';
import { SellerProfile } from '../backend/src/models/SellerProfile';
import { User } from '../backend/src/models/User';

// Get all sellers
export const getSellers = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  try {
    const { page = 1, limit = 10, category, rating, availability } = req.query;
    
    // Build query
    const query: any = { isApproved: true };
    if (category) query.serviceCategories = { $in: [category] };
    if (rating) query.rating = { $gte: Number(rating) };
    if (availability !== undefined) query.availability = availability === 'true';
    
    // Get sellers
    const sellers = await SellerProfile.find(query)
      .populate('userId', 'name email phone avatar')
      .sort({ rating: -1, reviewsCount: -1 });
    
    // Paginate results
    const paginatedResults = paginate(sellers, Number(page), Number(limit));
    
    sendSuccess(res, paginatedResults, 'Sellers retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Get seller by ID
export const getSellerById = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required',
        code: 'MISSING_ID'
      });
    }
    
    const seller = await SellerProfile.findById(id)
      .populate('userId', 'name email phone avatar');
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
        code: 'SELLER_NOT_FOUND'
      });
    }
    
    sendSuccess(res, seller, 'Seller retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Get seller profile (current user)
export const getSellerProfile = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication and seller role
  if (!requireAuth(req, res)) return;
  if (!requireSeller(req, res)) return;
  
  try {
    const user = extractUser(req);
    
    const sellerProfile = await SellerProfile.findOne({ userId: user.userId })
      .populate('userId', 'name email phone avatar');
    
    if (!sellerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }
    
    sendSuccess(res, sellerProfile, 'Seller profile retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Create seller profile
export const createProfile = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication and seller role
  if (!requireAuth(req, res)) return;
  if (!requireSeller(req, res)) return;
  
  try {
    const user = extractUser(req);
    const { bio, location, serviceCategories, yearsOfExperience, certifications, profilePicture, portfolio } = parseBody(req);
    
    // Validation
    if (!bio || !location || !serviceCategories || !yearsOfExperience) {
      return res.status(400).json({
        success: false,
        message: 'Bio, location, service categories, and years of experience are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Check if profile already exists
    const existingProfile = await SellerProfile.findOne({ userId: user.userId });
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'Seller profile already exists',
        code: 'PROFILE_EXISTS'
      });
    }
    
    // Create seller profile
    const sellerProfile = new SellerProfile({
      userId: user.userId,
      bio,
      location,
      serviceCategories,
      yearsOfExperience,
      certifications: certifications || [],
      profilePicture: profilePicture || '',
      portfolio: portfolio || [],
      rating: 0,
      reviewsCount: 0,
      availability: true,
      isApproved: false
    });
    
    await sellerProfile.save();
    
    // Populate user data
    await sellerProfile.populate('userId', 'name email phone avatar');
    
    sendSuccess(res, sellerProfile, 'Seller profile created successfully', 201);
    
  } catch (error) {
    handleError(error, res);
  }
});

// Update seller profile
export const updateProfile = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication and seller role
  if (!requireAuth(req, res)) return;
  if (!requireSeller(req, res)) return;
  
  try {
    const user = extractUser(req);
    const { bio, location, serviceCategories, yearsOfExperience, certifications, availability, profilePicture, portfolio } = parseBody(req);
    
    const sellerProfile = await SellerProfile.findOne({ userId: user.userId });
    if (!sellerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }
    
    // Update fields
    if (bio !== undefined) sellerProfile.bio = bio;
    if (location !== undefined) sellerProfile.location = location;
    if (serviceCategories !== undefined) sellerProfile.serviceCategories = serviceCategories;
    if (yearsOfExperience !== undefined) sellerProfile.yearsOfExperience = yearsOfExperience;
    if (certifications !== undefined) sellerProfile.certifications = certifications;
    if (availability !== undefined) sellerProfile.availability = availability;
    if (profilePicture !== undefined) sellerProfile.profilePicture = profilePicture;
    if (portfolio !== undefined) sellerProfile.portfolio = portfolio;
    
    await sellerProfile.save();
    
    // Populate user data
    await sellerProfile.populate('userId', 'name email phone avatar');
    
    sendSuccess(res, sellerProfile, 'Seller profile updated successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Main handler for seller routes
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const route = Array.isArray(slug) ? slug[0] : slug;
  
  switch (route) {
    case 'profile':
      return getSellerProfile(req, res);
    case 'create':
      return createProfile(req, res);
    case 'update':
      return updateProfile(req, res);
    default:
      // Handle individual seller by ID
      if (route && route.length === 24) { // MongoDB ObjectId length
        return getSellerById(req, res);
      }
      
      // Default to get all sellers
      return getSellers(req, res);
  }
}
