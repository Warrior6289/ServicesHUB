import express from 'express';
import * as userController from '../controllers/userController';
import { authenticate, requireEmailVerification } from '../middleware/auth';
import { 
  validatePasswordChange,
  validateFileUpload,
  validatePagination
} from '../middleware/validation';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', validatePasswordChange, userController.changePassword);
router.post('/avatar', upload.single('avatar'), validateFileUpload, userController.uploadAvatar);
router.delete('/account', userController.deleteAccount);

// User data routes
router.get('/stats', userController.getUserStats);
router.get('/activity', validatePagination, userController.getUserActivity);
router.put('/preferences', userController.updatePreferences);

export default router;
