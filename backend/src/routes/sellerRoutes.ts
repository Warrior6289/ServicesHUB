import express from 'express';
import * as sellerController from '../controllers/sellerController';
import { authenticate, sellerOnly, optionalAuthenticate } from '../middleware/auth';
import { 
  validateSellerProfile,
  validateMultipleFileUpload,
  validatePagination,
  validateSearch
} from '../middleware/validation';
import multer from 'multer';

const router = express.Router();

// Configure multer for portfolio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/portfolio/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `portfolio-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public routes
router.get('/', validateSearch, sellerController.getSellers);
router.get('/top-rated', sellerController.getTopRatedSellers);
router.get('/category/:category', validatePagination, sellerController.getSellersByCategory);
router.get('/nearby', validateSearch, sellerController.getNearbySellers);
router.get('/:id', sellerController.getSellerById);

// Protected routes
router.use(authenticate);

// Seller profile management
router.get('/profile/me', sellerOnly, sellerController.getSellerProfile);
router.post('/profile', sellerOnly, validateSellerProfile, sellerController.createProfile);
router.put('/profile', sellerOnly, sellerController.updateProfile);
router.put('/availability', sellerOnly, sellerController.updateAvailability);
router.get('/stats', sellerOnly, sellerController.getSellerStats);

// Portfolio management
router.post('/portfolio', sellerOnly, upload.array('portfolio', 5), validateMultipleFileUpload, sellerController.uploadPortfolio);

export default router;
