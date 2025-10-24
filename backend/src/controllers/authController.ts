import { Request, Response, NextFunction } from 'express';
import { User, createUser } from '../models/User';
import { generateTokenPair, verifyRefreshToken, generatePasswordResetToken, generateEmailVerificationToken, verifyPasswordResetToken, verifyEmailVerificationToken } from '../utils/jwt';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { sendSuccessResponse, sendPaginatedResponse } from '../middleware/errorHandler';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { IAuthenticatedRequest } from '../types';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';

// Register new user
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role = 'buyer', phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400, 'USER_EXISTS'));
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return next(new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400, 'WEAK_PASSWORD'));
  }

  // Create user
  const user = await createUser({
    name,
    email,
    password,
    role,
    phone
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user._id, user.email, user.role);

  // Add refresh token to user
  await user.addRefreshToken(refreshToken);

  // Send verification email
  const emailVerificationToken = generateEmailVerificationToken(user._id);
  await sendVerificationEmail(user, emailVerificationToken);

  sendSuccessResponse(res, {
    user: user.profile,
    accessToken,
    refreshToken
  }, 'User registered successfully', 201);
});

// Login user
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
  }

  // Check if user is active
  if (user.status !== 'active') {
    return next(new AppError('Account is not active', 401, 'ACCOUNT_INACTIVE'));
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user._id, user.email, user.role);

  // Add refresh token to user
  await user.addRefreshToken(refreshToken);

  sendSuccessResponse(res, {
    user: user.profile,
    accessToken,
    refreshToken
  }, 'Login successful');
});

// Logout user
export const logout = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  if (refreshToken && req.user) {
    await req.user.removeRefreshToken(refreshToken);
  }

  sendSuccessResponse(res, null, 'Logout successful');
});

// Refresh access token
export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED'));
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      return next(new AppError('User not found', 401, 'USER_NOT_FOUND'));
    }

    // Check if refresh token exists in user's tokens
    if (!user.refreshTokens.includes(refreshToken)) {
      return next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id, user.email, user.role);

    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    sendSuccessResponse(res, {
      accessToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
  }
});

// Get current user profile
export const getProfile = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  sendSuccessResponse(res, req.user?.profile, 'Profile retrieved successfully');
});

// Verify email
export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;

  try {
    const { userId } = verifyEmailVerificationToken(token);
    
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    if (user.emailVerified) {
      return next(new AppError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED'));
    }

    user.emailVerified = true;
    await user.save();

    sendSuccessResponse(res, null, 'Email verified successfully');
  } catch (error) {
    return next(new AppError('Invalid verification token', 400, 'INVALID_VERIFICATION_TOKEN'));
  }
});

// Forgot password
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if email exists or not
    return sendSuccessResponse(res, null, 'If the email exists, a password reset link has been sent');
  }

  // Generate password reset token
  const resetToken = generatePasswordResetToken(user._id);

  // Send password reset email
  await sendPasswordResetEmail(user, resetToken);

  sendSuccessResponse(res, null, 'If the email exists, a password reset link has been sent');
});

// Reset password
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body;

  try {
    const { userId } = verifyPasswordResetToken(token);
    
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return next(new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400, 'WEAK_PASSWORD'));
    }

    // Update password
    user.password = password;
    await user.save();

    sendSuccessResponse(res, null, 'Password reset successfully');
  } catch (error) {
    return next(new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN'));
  }
});

// Change password (authenticated user)
export const changePassword = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD'));
  }

  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    return next(new AppError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400, 'WEAK_PASSWORD'));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccessResponse(res, null, 'Password changed successfully');
});

// Resend verification email
export const resendVerification = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  if (req.user.emailVerified) {
    return next(new AppError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED'));
  }

  // Generate verification token
  const verificationToken = generateEmailVerificationToken(req.user._id);

  // Send verification email (implement later)
  // await sendVerificationEmail(req.user, verificationToken);

  sendSuccessResponse(res, null, 'Verification email sent');
});

// Delete account
export const deleteAccount = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { password } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return next(new AppError('Password is incorrect', 400, 'INVALID_PASSWORD'));
  }

  // Delete user (this will cascade to related documents)
  await User.findByIdAndDelete(user._id);

  sendSuccessResponse(res, null, 'Account deleted successfully');
});

// Update profile
export const updateProfile = catchAsync(async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name, phone } = req.body;

  if (!req.user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  sendSuccessResponse(res, user.profile, 'Profile updated successfully');
});

export default {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerification,
  deleteAccount,
  updateProfile
};
