import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Password validation rules
export const passwordValidation = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Validate password strength
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < passwordValidation.minLength) {
    errors.push(`Password must be at least ${passwordValidation.minLength} characters long`);
  }

  if (password.length > passwordValidation.maxLength) {
    errors.push(`Password cannot exceed ${passwordValidation.maxLength} characters`);
  }

  if (passwordValidation.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (passwordValidation.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (passwordValidation.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (passwordValidation.requireSpecialChars && !new RegExp(`[${passwordValidation.specialChars}]`).test(password)) {
    errors.push(`Password must contain at least one special character (${passwordValidation.specialChars})`);
  }

  // Check for common passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Failed to compare password');
  }
};

// Generate random password
export const generateRandomPassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Generate secure random string
export const generateSecureRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate password reset code
export const generatePasswordResetCode = (): string => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit code
};

// Generate email verification code
export const generateEmailVerificationCode = (): string => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit code
};

// Check if password has been compromised (basic check)
export const isPasswordCompromised = (password: string): boolean => {
  const compromisedPatterns = [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i,
    /master/i,
    /shadow/i
  ];

  return compromisedPatterns.some(pattern => pattern.test(password));
};

// Password entropy calculation
export const calculatePasswordEntropy = (password: string): number => {
  const charsetSize = getCharsetSize(password);
  const length = password.length;
  return Math.log2(Math.pow(charsetSize, length));
};

// Get charset size for entropy calculation
const getCharsetSize = (password: string): number => {
  let charsetSize = 0;
  
  if (/[a-z]/.test(password)) charsetSize += 26; // lowercase
  if (/[A-Z]/.test(password)) charsetSize += 26; // uppercase
  if (/\d/.test(password)) charsetSize += 10; // digits
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) charsetSize += 32; // special chars
  
  return charsetSize;
};

// Password strength score (0-100)
export const getPasswordStrengthScore = (password: string): number => {
  const validation = validatePasswordStrength(password);
  
  if (!validation.isValid) {
    return 0;
  }

  let score = 0;
  
  // Length score (0-30 points)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character variety score (0-40 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 10;
  
  // Entropy score (0-30 points)
  const entropy = calculatePasswordEntropy(password);
  if (entropy >= 50) score += 30;
  else if (entropy >= 40) score += 20;
  else if (entropy >= 30) score += 10;
  
  return Math.min(score, 100);
};

// Password strength description
export const getPasswordStrengthDescription = (score: number): string => {
  if (score >= 80) return 'Very Strong';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Medium';
  if (score >= 20) return 'Weak';
  return 'Very Weak';
};

// Generate salt for password hashing
export const generateSalt = async (rounds: number = 12): Promise<string> => {
  try {
    return await bcrypt.genSalt(rounds);
  } catch (error) {
    throw new Error('Failed to generate salt');
  }
};

// Hash password with custom salt
export const hashPasswordWithSalt = async (password: string, salt: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Failed to hash password with salt');
  }
};
