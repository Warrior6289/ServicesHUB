import express from 'express';
import * as serviceRequestController from '../controllers/serviceRequestController';
import { authenticate, buyerOnly, sellerOnly, optionalAuthenticate } from '../middleware/auth';
import { 
  validateServiceRequest,
  validatePriceBoost,
  validatePagination,
  validateSearch
} from '../middleware/validation';

const router = express.Router();

// Public routes
router.get('/nearby', validateSearch, serviceRequestController.getNearbyRequests);

// Protected routes
router.use(authenticate);

// Service request creation
router.post('/instant', buyerOnly, validateServiceRequest, serviceRequestController.createInstantRequest);
router.post('/scheduled', buyerOnly, validateServiceRequest, serviceRequestController.createScheduledRequest);

// Service request management
router.get('/user', serviceRequestController.getUserRequests);
router.get('/seller', sellerOnly, serviceRequestController.getSellerRequests);
router.get('/stats', serviceRequestController.getRequestStats);
router.get('/:id', serviceRequestController.getRequestById);

// Service request actions
router.put('/:id/boost', buyerOnly, validatePriceBoost, serviceRequestController.boostPrice);
router.put('/:id/accept', sellerOnly, serviceRequestController.acceptRequest);
router.put('/:id/status', serviceRequestController.updateStatus);
router.delete('/:id', serviceRequestController.deleteRequest);

export default router;
