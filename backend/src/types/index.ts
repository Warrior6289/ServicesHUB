import { Request } from 'express';
import { Document } from 'mongoose';

// User interfaces
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'admin';
  status: 'active' | 'blocked' | 'pending';
  emailVerified: boolean;
  phone?: string;
  avatar?: string;
  lastLogin?: Date;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role?: 'buyer' | 'seller' | 'admin';
  phone?: string;
}

// Seller Profile interfaces
export interface ISellerProfile extends Document {
  _id: string;
  userId: string;
  bio: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  serviceCategories: string[];
  yearsOfExperience: number;
  certifications: string[];
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  availability: boolean;
  profilePicture?: string;
  portfolio: string[];
  isApproved: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  averageRating: number;
  completionPercentage: number;
  
  // Methods
  updateRating(newRating: number): Promise<void>;
  addPortfolioImage(imageUrl: string): Promise<void>;
  removePortfolioImage(imageUrl: string): Promise<void>;
}

export interface ISellerProfileCreate {
  userId: string;
  bio: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  serviceCategories: string[];
  yearsOfExperience: number;
  certifications?: string[];
  profilePicture?: string;
  portfolio?: string[];
}

// Service Request interfaces
export interface IServiceRequest extends Document {
  _id: string;
  buyerId: string;
  sellerId?: string;
  category: string;
  type: 'instant' | 'scheduled';
  description: string;
  price: number;
  priceHistory: {
    amount: number;
    timestamp: Date;
    boostedBy?: string;
  }[];
  location: {
    address: string;
    coordinates: [number, number];
  };
  status: 'pending' | 'price_boosted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  scheduledDate?: Date;
  scheduledTime?: string;
  broadcastRadius?: number;
  expiresAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  timeRemaining: number | null;
  isExpired: boolean;
  priceIncreasePercentage: number;
  
  // Methods
  boostPrice(newPrice: number, boostedBy: string): Promise<void>;
  acceptRequest(sellerId: string): Promise<void>;
  updateStatus(newStatus: string, reason?: string): Promise<void>;
}

export interface IServiceRequestCreate {
  buyerId: string;
  category: string;
  type: 'instant' | 'scheduled';
  description: string;
  price: number;
  location: {
    address: string;
    coordinates: [number, number];
  };
  scheduledDate?: Date;
  scheduledTime?: string;
  broadcastRadius?: number;
}

// Transaction interfaces
export interface ITransaction extends Document {
  _id: string;
  serviceRequestId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'stripe';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  refundedAt?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  platformFee: number;
  sellerPayout: number;
  isRefundable: boolean;
  
  // Methods
  markCompleted(stripeChargeId?: string): Promise<void>;
  processRefund(reason: string): Promise<void>;
  markFailed(): Promise<void>;
}

export interface ITransactionCreate {
  serviceRequestId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'stripe';
  stripePaymentIntentId?: string;
}

// JWT interfaces
export interface IJwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface IRefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

// API Error interface
export interface IApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Authenticated Request interface
export interface IAuthenticatedRequest extends Request {
  user?: IUser;
  token?: string;
}

// Pagination interface
export interface IPaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search interface
export interface ISearchOptions {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  radius?: number;
  coordinates?: [number, number];
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Email interfaces
export interface IEmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface IEmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// File upload interfaces
export interface IFileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Analytics interfaces
export interface IAnalyticsData {
  totalUsers: number;
  totalSellers: number;
  totalServiceRequests: number;
  totalTransactions: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
  recentActivity: any[];
}

// Audit log interfaces
export interface IAuditLog {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Response interfaces
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface IErrorResponse {
  success: false;
  message: string;
  error?: string;
  code?: string;
  details?: any;
}

// Configuration interfaces
export interface IConfig {
  app: {
    name: string;
    version: string;
    env: 'development' | 'production' | 'test';
    port: number;
    url: string;
  };
  database: {
    url: string;
    options: any;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  cors: {
    origin: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  email: {
    service: string;
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
}

// Service interfaces
export interface ILocationService {
  calculateDistance(coords1: [number, number], coords2: [number, number]): number;
  findNearby(coordinates: [number, number], radius: number): any[];
}

export interface IEmailService {
  sendEmail(options: IEmailOptions): Promise<void>;
  sendWelcomeEmail(user: IUser): Promise<void>;
  sendVerificationEmail(user: IUser, token: string): Promise<void>;
  sendPasswordResetEmail(user: IUser, token: string): Promise<void>;
}

export interface IFileService {
  uploadFile(file: IFileUpload): Promise<string>;
  deleteFile(url: string): Promise<void>;
  optimizeImage(url: string): Promise<string>;
}

export interface IPaymentService {
  createPaymentIntent(amount: number, currency: string): Promise<any>;
  confirmPayment(paymentIntentId: string): Promise<any>;
  refundPayment(chargeId: string, amount?: number): Promise<any>;
}

// Middleware interfaces
export interface IAuthMiddleware {
  authenticate(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  authorize(...roles: string[]): (req: IAuthenticatedRequest, res: any, next: any) => void;
  optionalAuthenticate(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
}

export interface IValidationMiddleware {
  validateUserRegistration: any[];
  validateUserLogin: any[];
  validatePasswordChange: any[];
  validateServiceRequest: any[];
  validateSellerProfile: any[];
}

// Controller interfaces
export interface IAuthController {
  register(req: Request, res: any, next: any): Promise<void>;
  login(req: Request, res: any, next: any): Promise<void>;
  logout(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  refreshToken(req: Request, res: any, next: any): Promise<void>;
  verifyEmail(req: Request, res: any, next: any): Promise<void>;
  forgotPassword(req: Request, res: any, next: any): Promise<void>;
  resetPassword(req: Request, res: any, next: any): Promise<void>;
  getProfile(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
}

export interface IUserController {
  getProfile(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  updateProfile(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  changePassword(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  deleteAccount(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  uploadAvatar(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
}

export interface ISellerController {
  getSellers(req: Request, res: any, next: any): Promise<void>;
  getSellerById(req: Request, res: any, next: any): Promise<void>;
  createProfile(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  updateProfile(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  getSellersByCategory(req: Request, res: any, next: any): Promise<void>;
  getNearbySellers(req: Request, res: any, next: any): Promise<void>;
  uploadPortfolio(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
}

export interface IServiceRequestController {
  createInstantRequest(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  createScheduledRequest(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  getUserRequests(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  getSellerRequests(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  getRequestById(req: Request, res: any, next: any): Promise<void>;
  boostPrice(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  acceptRequest(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  updateStatus(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  deleteRequest(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  getNearbyRequests(req: Request, res: any, next: any): Promise<void>;
}

export interface IAdminController {
  getUsers(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  blockUser(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  unblockUser(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  updateUserRole(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  getPendingSellers(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  approveSeller(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  rejectSeller(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  getAnalytics(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
  getAuditLogs(req: IAuthenticatedRequest, res: any, next: any): Promise<void>;
}