import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IJwtPayload, IRefreshTokenPayload } from '../types';

// Generate access token
export const generateAccessToken = (payload: Omit<IJwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: config.app.name,
    audience: config.app.name
  });
};

// Generate refresh token
export const generateRefreshToken = (payload: Omit<IRefreshTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: config.app.name,
    audience: config.app.name
  });
};

// Verify access token
export const verifyAccessToken = (token: string): IJwtPayload => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: config.app.name,
      audience: config.app.name
    }) as IJwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): IRefreshTokenPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: config.app.name,
      audience: config.app.name
    }) as IRefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

// Generate token pair
export const generateTokenPair = (userId: string, email: string, role: string) => {
  const accessToken = generateAccessToken({
    userId,
    email,
    role
  });

  const refreshToken = generateRefreshToken({
    userId,
    tokenVersion: 1 // This can be used for token invalidation
  });

  return {
    accessToken,
    refreshToken
  };
};

// Decode token without verification (for debugging)
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Failed to decode token');
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Generate password reset token
export const generatePasswordResetToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'password_reset' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
};

// Verify password reset token
export const verifyPasswordResetToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }
    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Password reset token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid password reset token');
    } else {
      throw new Error('Password reset token verification failed');
    }
  }
};

// Generate email verification token
export const generateEmailVerificationToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'email_verification' },
    config.jwt.secret,
    { expiresIn: '24h' }
  );
};

// Verify email verification token
export const verifyEmailVerificationToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }
    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Email verification token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid email verification token');
    } else {
      throw new Error('Email verification token verification failed');
    }
  }
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// Generate API key (for admin operations)
export const generateApiKey = (): string => {
  const payload = {
    type: 'api_key',
    timestamp: Date.now()
  };
  
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '365d', // 1 year
    issuer: config.app.name,
    audience: config.app.name
  });
};

// Verify API key
export const verifyApiKey = (apiKey: string): boolean => {
  try {
    const decoded = jwt.verify(apiKey, config.jwt.secret) as any;
    return decoded.type === 'api_key';
  } catch (error) {
    return false;
  }
};
