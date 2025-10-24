import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, adminOnly } from '../middleware/auth';
import { 
  validatePagination,
  validateAdminUserUpdate
} from '../middleware/validation';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// User management
router.get('/users', validatePagination, adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);
router.put('/users/:id/role', validateAdminUserUpdate, adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Seller management
router.get('/sellers/pending', validatePagination, adminController.getPendingSellers);
router.put('/sellers/:id/approve', adminController.approveSeller);
router.put('/sellers/:id/reject', adminController.rejectSeller);

// Analytics and monitoring
router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', validatePagination, adminController.getAuditLogs);
router.get('/system-health', adminController.getSystemHealth);

export default router;
