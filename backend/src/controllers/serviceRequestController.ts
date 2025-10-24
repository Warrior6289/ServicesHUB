import { Request, Response, NextFunction } from 'express';
import { ServiceRequest, createServiceRequest, updateServiceRequest, getServiceRequestById } from '../models/ServiceRequest';
import { sendSuccessResponse, sendPaginatedResponse } from '../middleware/errorHandler';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { IAuthenticatedRequest } from '../types';

// Create instant service request
export const createInstantRequest = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { category, description, price, location, broadcastRadius = 10 } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const requestData = {
    buyerId: req.user._id,
    category,
    type: 'instant' as const,
    description,
    price,
    location,
    broadcastRadius
  };

  const serviceRequest = await createServiceRequest(requestData);

  sendSuccessResponse(res, serviceRequest, 'Instant service request created successfully', 201);
});

// Create scheduled service request
export const createScheduledRequest = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { category, description, price, location, scheduledDate, scheduledTime } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const requestData = {
    buyerId: req.user._id,
    category,
    type: 'scheduled' as const,
    description,
    price,
    location,
    scheduledDate: new Date(scheduledDate),
    scheduledTime
  };

  const serviceRequest = await createServiceRequest(requestData);

  sendSuccessResponse(res, serviceRequest, 'Scheduled service request created successfully', 201);
});

// Get user's service requests
export const getUserRequests = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10, status } = req.query;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const requests = await ServiceRequest.findByBuyer(req.user._id, status as string);
  const total = requests.length;
  const pages = Math.ceil(total / Number(limit));
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedRequests = requests.slice(skip, skip + Number(limit));

  sendPaginatedResponse(res, paginatedRequests, {
    page: Number(page),
    limit: Number(limit),
    total,
    pages
  }, 'User service requests retrieved successfully');
});

// Get seller's service requests
export const getSellerRequests = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { page = 1, limit = 10, status } = req.query;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const requests = await ServiceRequest.findBySeller(req.user._id, status as string);
  const total = requests.length;
  const pages = Math.ceil(total / Number(limit));
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedRequests = requests.slice(skip, skip + Number(limit));

  sendPaginatedResponse(res, paginatedRequests, {
    page: Number(page),
    limit: Number(limit),
    total,
    pages
  }, 'Seller service requests retrieved successfully');
});

// Get service request by ID
export const getRequestById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const serviceRequest = await getServiceRequestById(id);
  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404, 'REQUEST_NOT_FOUND'));
  }

  sendSuccessResponse(res, serviceRequest, 'Service request retrieved successfully');
});

// Boost price for instant request
export const boostPrice = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { newPrice } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const serviceRequest = await getServiceRequestById(id);
  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404, 'REQUEST_NOT_FOUND'));
  }

  // Check if user owns the request
  if (serviceRequest.buyerId.toString() !== req.user._id) {
    return next(new AppError('You can only boost your own requests', 403, 'FORBIDDEN'));
  }

  // Check if request is instant type
  if (serviceRequest.type !== 'instant') {
    return next(new AppError('Only instant requests can be boosted', 400, 'INVALID_REQUEST_TYPE'));
  }

  // Check if request is still active
  if (!['pending', 'price_boosted'].includes(serviceRequest.status)) {
    return next(new AppError('Request is no longer active', 400, 'REQUEST_NOT_ACTIVE'));
  }

  try {
    await serviceRequest.boostPrice(newPrice, req.user._id);
    sendSuccessResponse(res, serviceRequest, 'Price boosted successfully');
  } catch (error) {
    return next(new AppError(error instanceof Error ? error.message : 'Failed to boost price', 400, 'BOOST_FAILED'));
  }
});

// Accept service request (seller)
export const acceptRequest = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const serviceRequest = await getServiceRequestById(id);
  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404, 'REQUEST_NOT_FOUND'));
  }

  // Check if request is still available
  if (!['pending', 'price_boosted'].includes(serviceRequest.status)) {
    return next(new AppError('Request is no longer available', 400, 'REQUEST_NOT_AVAILABLE'));
  }

  try {
    await serviceRequest.acceptRequest(req.user._id);
    sendSuccessResponse(res, serviceRequest, 'Request accepted successfully');
  } catch (error) {
    return next(new AppError(error instanceof Error ? error.message : 'Failed to accept request', 400, 'ACCEPT_FAILED'));
  }
});

// Update service request status
export const updateStatus = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const serviceRequest = await getServiceRequestById(id);
  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404, 'REQUEST_NOT_FOUND'));
  }

  // Check if user has permission to update status
  const isOwner = serviceRequest.buyerId.toString() === req.user._id;
  const isSeller = serviceRequest.sellerId?.toString() === req.user._id;
  
  if (!isOwner && !isSeller) {
    return next(new AppError('You can only update your own requests', 403, 'FORBIDDEN'));
  }

  try {
    await serviceRequest.updateStatus(status, reason);
    sendSuccessResponse(res, serviceRequest, 'Status updated successfully');
  } catch (error) {
    return next(new AppError(error instanceof Error ? error.message : 'Failed to update status', 400, 'UPDATE_FAILED'));
  }
});

// Delete service request
export const deleteRequest = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const serviceRequest = await getServiceRequestById(id);
  if (!serviceRequest) {
    return next(new AppError('Service request not found', 404, 'REQUEST_NOT_FOUND'));
  }

  // Check if user owns the request
  if (serviceRequest.buyerId.toString() !== req.user._id) {
    return next(new AppError('You can only delete your own requests', 403, 'FORBIDDEN'));
  }

  // Check if request can be deleted
  if (['completed', 'in_progress'].includes(serviceRequest.status)) {
    return next(new AppError('Cannot delete active or completed requests', 400, 'DELETE_NOT_ALLOWED'));
  }

  await ServiceRequest.findByIdAndDelete(id);

  sendSuccessResponse(res, null, 'Service request deleted successfully');
});

// Get nearby instant requests
export const getNearbyRequests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { lat, lng, radius = 50, category, page = 1, limit = 10 } = req.query;

  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude are required', 400, 'COORDINATES_REQUIRED'));
  }

  const coordinates: [number, number] = [Number(lng), Number(lat)];
  const requests = await ServiceRequest.findNearbyInstant(coordinates, Number(radius));
  
  // Filter by category if provided
  let filteredRequests = requests;
  if (category) {
    filteredRequests = requests.filter(req => req.category === category);
  }

  const total = filteredRequests.length;
  const pages = Math.ceil(total / Number(limit));
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedRequests = filteredRequests.slice(skip, skip + Number(limit));

  sendPaginatedResponse(res, paginatedRequests, {
    page: Number(page),
    limit: Number(limit),
    total,
    pages
  }, 'Nearby requests retrieved successfully');
});

// Get service request statistics
export const getRequestStats = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  let stats = {};

  if (req.user.role === 'buyer') {
    const [total, pending, accepted, completed, cancelled] = await Promise.all([
      ServiceRequest.countDocuments({ buyerId: req.user._id }),
      ServiceRequest.countDocuments({ buyerId: req.user._id, status: 'pending' }),
      ServiceRequest.countDocuments({ buyerId: req.user._id, status: 'accepted' }),
      ServiceRequest.countDocuments({ buyerId: req.user._id, status: 'completed' }),
      ServiceRequest.countDocuments({ buyerId: req.user._id, status: 'cancelled' })
    ]);

    stats = { total, pending, accepted, completed, cancelled };
  } else if (req.user.role === 'seller') {
    const [total, accepted, inProgress, completed, cancelled] = await Promise.all([
      ServiceRequest.countDocuments({ sellerId: req.user._id }),
      ServiceRequest.countDocuments({ sellerId: req.user._id, status: 'accepted' }),
      ServiceRequest.countDocuments({ sellerId: req.user._id, status: 'in_progress' }),
      ServiceRequest.countDocuments({ sellerId: req.user._id, status: 'completed' }),
      ServiceRequest.countDocuments({ sellerId: req.user._id, status: 'cancelled' })
    ]);

    stats = { total, accepted, inProgress, completed, cancelled };
  }

  sendSuccessResponse(res, stats, 'Request statistics retrieved successfully');
});

export default {
  createInstantRequest,
  createScheduledRequest,
  getUserRequests,
  getSellerRequests,
  getRequestById,
  boostPrice,
  acceptRequest,
  updateStatus,
  deleteRequest,
  getNearbyRequests,
  getRequestStats
};
