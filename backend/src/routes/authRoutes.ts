import express from 'express';
import * as authController from '../controllers/authController';
import { authenticate, authRateLimit, passwordResetRateLimit, emailVerificationRateLimit } from '../middleware/auth';
import { 
  validateUserRegistration, 
  validateUserLogin, 
  validatePasswordChange,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validateEmailVerification
} from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/register', authRateLimit, validateUserRegistration, authController.register);
router.post('/login', authRateLimit, validateUserLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify-email', emailVerificationRateLimit, validateEmailVerification, authController.verifyEmail);
router.post('/forgot-password', passwordResetRateLimit, validatePasswordReset, authController.forgotPassword);
router.post('/reset-password', passwordResetRateLimit, validatePasswordResetConfirm, authController.resetPassword);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/me', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/password', validatePasswordChange, authController.changePassword);
router.post('/logout', authController.logout);
router.post('/resend-verification', emailVerificationRateLimit, authController.resendVerification);
router.delete('/account', authController.deleteAccount);

export default router;
