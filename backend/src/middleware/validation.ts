import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { handleValidationError } from './errorHandler';

// Validation result handler
export const handleValidationResults = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = handleValidationError(errors.array());
    return next(error);
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isIn(['buyer', 'seller'])
    .withMessage('Role must be either buyer or seller'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationResults
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationResults
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  
  handleValidationResults
];

// Password reset validation
export const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationResults
];

// Password reset confirm validation
export const validatePasswordResetConfirm = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationResults
];

// Email verification validation
export const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  
  handleValidationResults
];

// Seller profile validation
export const validateSellerProfile = [
  body('bio')
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Bio must be between 50 and 1000 characters'),
  
  body('location.address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of 2 numbers')
    .custom((coords) => {
      if (!Array.isArray(coords) || coords.length !== 2) {
        throw new Error('Coordinates must be an array of 2 numbers');
      }
      const [lng, lat] = coords;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error('Coordinates must be numbers');
      }
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  
  body('serviceCategories')
    .isArray({ min: 1 })
    .withMessage('At least one service category is required')
    .custom((categories) => {
      const validCategories = [
        'Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Carpentry',
        'Landscaping', 'Painting', 'Flooring', 'Roofing', 'Appliance Repair',
        'Handyman', 'Moving', 'Pet Care', 'Tutoring', 'Photography',
        'Event Planning', 'Personal Training', 'Beauty Services', 'IT Support', 'Legal Services'
      ];
      
      if (!Array.isArray(categories)) {
        throw new Error('Service categories must be an array');
      }
      
      for (const category of categories) {
        if (!validCategories.includes(category)) {
          throw new Error(`Invalid service category: ${category}`);
        }
      }
      
      return true;
    }),
  
  body('yearsOfExperience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
  
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  
  body('certifications.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Certification name cannot exceed 100 characters'),
  
  handleValidationResults
];

// Service request validation
export const validateServiceRequest = [
  body('category')
    .isIn([
      'Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Carpentry',
      'Landscaping', 'Painting', 'Flooring', 'Roofing', 'Appliance Repair',
      'Handyman', 'Moving', 'Pet Care', 'Tutoring', 'Photography',
      'Event Planning', 'Personal Training', 'Beauty Services', 'IT Support', 'Legal Services'
    ])
    .withMessage('Invalid service category'),
  
  body('type')
    .isIn(['instant', 'scheduled'])
    .withMessage('Request type must be either instant or scheduled'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  
  body('price')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Price must be between $1 and $10,000'),
  
  body('location.address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of 2 numbers')
    .custom((coords) => {
      if (!Array.isArray(coords) || coords.length !== 2) {
        throw new Error('Coordinates must be an array of 2 numbers');
      }
      const [lng, lat] = coords;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error('Coordinates must be numbers');
      }
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date')
    .custom((date) => {
      if (new Date(date) < new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  
  body('scheduledTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Scheduled time must be in HH:MM format'),
  
  body('broadcastRadius')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Broadcast radius must be between 1 and 100 km'),
  
  handleValidationResults
];

// Price boost validation
export const validatePriceBoost = [
  body('newPrice')
    .isFloat({ min: 1 })
    .withMessage('New price must be greater than 0'),
  
  handleValidationResults
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'price', 'rating'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
  
  handleValidationResults
];

// Search validation
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  query('category')
    .optional()
    .isIn([
      'Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Carpentry',
      'Landscaping', 'Painting', 'Flooring', 'Roofing', 'Appliance Repair',
      'Handyman', 'Moving', 'Pet Care', 'Tutoring', 'Photography',
      'Event Planning', 'Personal Training', 'Beauty Services', 'IT Support', 'Legal Services'
    ])
    .withMessage('Invalid category'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  query('radius')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Radius must be between 1 and 100 km'),
  
  handleValidationResults
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName: string) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  
  handleValidationResults
];

// File upload validation
export const validateFileUpload = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('File is required');
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Only JPEG, PNG, and WebP images are allowed');
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }
      
      return true;
    }),
  
  handleValidationResults
];

// Multiple file upload validation
export const validateMultipleFileUpload = [
  body('files')
    .custom((value, { req }) => {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new Error('At least one file is required');
      }
      
      if (req.files.length > 5) {
        throw new Error('Maximum 5 files allowed');
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      for (const file of req.files) {
        if (!allowedTypes.includes(file.mimetype)) {
          throw new Error('Only JPEG, PNG, and WebP images are allowed');
        }
        
        if (file.size > maxSize) {
          throw new Error('Each file must be less than 5MB');
        }
      }
      
      return true;
    }),
  
  handleValidationResults
];

// Admin user management validation
export const validateAdminUserUpdate = [
  body('status')
    .optional()
    .isIn(['active', 'blocked', 'pending'])
    .withMessage('Status must be active, blocked, or pending'),
  
  body('role')
    .optional()
    .isIn(['buyer', 'seller', 'admin'])
    .withMessage('Role must be buyer, seller, or admin'),
  
  handleValidationResults
];

// Contact form validation
export const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Message must be between 20 and 1000 characters'),
  
  handleValidationResults
];
