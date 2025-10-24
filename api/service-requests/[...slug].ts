import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions, parseBody, extractUser, rateLimit, withDatabase } from './_utils/db';
import { requireAuth, validateBody, handleError, sendSuccess, paginate } from './_middleware';
import { ServiceRequest } from '../backend/src/models/ServiceRequest';
import { User } from '../backend/src/models/User';

// Create instant service request
export const createInstantRequest = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication
  if (!requireAuth(req, res)) return;
  
  // Rate limiting
  if (!rateLimit(20, 900000)(req, res)) return;
  
  try {
    const user = extractUser(req);
    const { category, description, price, location, broadcastRadius = 10 } = parseBody(req);
    
    // Validation
    if (!category || !description || !price || !location) {
      return res.status(400).json({
        success: false,
        message: 'Category, description, price, and location are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    if (price < 1 || price > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Price must be between $1 and $10,000',
        code: 'INVALID_PRICE'
      });
    }
    
    if (broadcastRadius < 1 || broadcastRadius > 100) {
      return res.status(400).json({
        success: false,
        message: 'Broadcast radius must be between 1 and 100 km',
        code: 'INVALID_RADIUS'
      });
    }
    
    // Create service request
    const serviceRequest = new ServiceRequest({
      buyerId: user.userId,
      category,
      type: 'instant',
      description,
      price,
      location,
      broadcastRadius,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    await serviceRequest.save();
    
    // Populate user data
    await serviceRequest.populate('buyerId', 'name email phone');
    
    sendSuccess(res, serviceRequest, 'Instant service request created successfully', 201);
    
  } catch (error) {
    handleError(error, res);
  }
});

// Create scheduled service request
export const createScheduledRequest = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication
  if (!requireAuth(req, res)) return;
  
  // Rate limiting
  if (!rateLimit(20, 900000)(req, res)) return;
  
  try {
    const user = extractUser(req);
    const { category, description, price, location, scheduledDate, scheduledTime } = parseBody(req);
    
    // Validation
    if (!category || !description || !price || !location || !scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required for scheduled requests',
        code: 'MISSING_FIELDS'
      });
    }
    
    if (price < 1 || price > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Price must be between $1 and $10,000',
        code: 'INVALID_PRICE'
      });
    }
    
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future',
        code: 'INVALID_DATE'
      });
    }
    
    // Create service request
    const serviceRequest = new ServiceRequest({
      buyerId: user.userId,
      category,
      type: 'scheduled',
      description,
      price,
      location,
      scheduledDate: scheduledDateTime,
      scheduledTime
    });
    
    await serviceRequest.save();
    
    // Populate user data
    await serviceRequest.populate('buyerId', 'name email phone');
    
    sendSuccess(res, serviceRequest, 'Scheduled service request created successfully', 201);
    
  } catch (error) {
    handleError(error, res);
  }
});

// Get user's service requests
export const getUserRequests = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
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
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query: any = { buyerId: user.userId };
    if (status) query.status = status;
    
    // Get requests
    const requests = await ServiceRequest.find(query)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .sort({ createdAt: -1 });
    
    // Paginate results
    const paginatedResults = paginate(requests, Number(page), Number(limit));
    
    sendSuccess(res, paginatedResults, 'User service requests retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Get seller's service requests
export const getSellerRequests = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
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
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query: any = { sellerId: user.userId };
    if (status) query.status = status;
    
    // Get requests
    const requests = await ServiceRequest.find(query)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .sort({ createdAt: -1 });
    
    // Paginate results
    const paginatedResults = paginate(requests, Number(page), Number(limit));
    
    sendSuccess(res, paginatedResults, 'Seller service requests retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Get service request by ID
export const getRequestById = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
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
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
        code: 'MISSING_ID'
      });
    }
    
    const serviceRequest = await ServiceRequest.findById(id)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone');
    
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
        code: 'REQUEST_NOT_FOUND'
      });
    }
    
    sendSuccess(res, serviceRequest, 'Service request retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Boost price for instant request
export const boostPrice = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication
  if (!requireAuth(req, res)) return;
  
  try {
    const user = extractUser(req);
    const { id } = req.query;
    const { newPrice } = parseBody(req);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
        code: 'MISSING_ID'
      });
    }
    
    if (!newPrice) {
      return res.status(400).json({
        success: false,
        message: 'New price is required',
        code: 'MISSING_PRICE'
      });
    }
    
    const serviceRequest = await ServiceRequest.findById(id);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
        code: 'REQUEST_NOT_FOUND'
      });
    }
    
    // Check if user owns the request
    if (serviceRequest.buyerId.toString() !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only boost your own requests',
        code: 'FORBIDDEN'
      });
    }
    
    // Check if request is instant type
    if (serviceRequest.type !== 'instant') {
      return res.status(400).json({
        success: false,
        message: 'Only instant requests can be boosted',
        code: 'INVALID_REQUEST_TYPE'
      });
    }
    
    // Check if request is still active
    if (!['pending', 'price_boosted'].includes(serviceRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Request is no longer active',
        code: 'REQUEST_NOT_ACTIVE'
      });
    }
    
    // Boost price
    await serviceRequest.boostPrice(newPrice, user.userId);
    
    // Populate user data
    await serviceRequest.populate('buyerId', 'name email phone');
    await serviceRequest.populate('sellerId', 'name email phone');
    
    sendSuccess(res, serviceRequest, 'Price boosted successfully');
    
  } catch (error) {
    if (error.message === 'New price must be higher than current price') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'INVALID_PRICE'
      });
    }
    handleError(error, res);
  }
});

// Accept service request (seller)
export const acceptRequest = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  // Check authentication
  if (!requireAuth(req, res)) return;
  
  try {
    const user = extractUser(req);
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
        code: 'MISSING_ID'
      });
    }
    
    const serviceRequest = await ServiceRequest.findById(id);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
        code: 'REQUEST_NOT_FOUND'
      });
    }
    
    // Check if request is still available
    if (!['pending', 'price_boosted'].includes(serviceRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Request is no longer available',
        code: 'REQUEST_NOT_AVAILABLE'
      });
    }
    
    // Accept request
    await serviceRequest.acceptRequest(user.userId);
    
    // Populate user data
    await serviceRequest.populate('buyerId', 'name email phone');
    await serviceRequest.populate('sellerId', 'name email phone');
    
    sendSuccess(res, serviceRequest, 'Request accepted successfully');
    
  } catch (error) {
    if (error.message === 'Request has already been accepted') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'REQUEST_ALREADY_ACCEPTED'
      });
    }
    handleError(error, res);
  }
});

// Get nearby instant requests
export const getNearbyRequests = withDatabase(async (req: VercelRequest, res: VercelResponse, db: any) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  setCorsHeaders(res);
  
  try {
    const { lat, lng, radius = 50, category, page = 1, limit = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
        code: 'COORDINATES_REQUIRED'
      });
    }
    
    const coordinates: [number, number] = [Number(lng), Number(lat)];
    const requests = await ServiceRequest.findNearbyInstant(coordinates, Number(radius));
    
    // Filter by category if provided
    let filteredRequests = requests;
    if (category) {
      filteredRequests = requests.filter(req => req.category === category);
    }
    
    // Paginate results
    const paginatedResults = paginate(filteredRequests, Number(page), Number(limit));
    
    sendSuccess(res, paginatedResults, 'Nearby requests retrieved successfully');
    
  } catch (error) {
    handleError(error, res);
  }
});

// Main handler for service request routes
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const route = Array.isArray(slug) ? slug[0] : slug;
  
  switch (route) {
    case 'instant':
      return createInstantRequest(req, res);
    case 'scheduled':
      return createScheduledRequest(req, res);
    case 'user':
      return getUserRequests(req, res);
    case 'seller':
      return getSellerRequests(req, res);
    case 'nearby':
      return getNearbyRequests(req, res);
    case 'boost':
      return boostPrice(req, res);
    case 'accept':
      return acceptRequest(req, res);
    default:
      // Handle individual request by ID
      if (route && route.length === 24) { // MongoDB ObjectId length
        return getRequestById(req, res);
      }
      
      return res.status(404).json({
        success: false,
        message: 'Service request endpoint not found',
        code: 'NOT_FOUND'
      });
  }
}
