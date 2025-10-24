import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  transformation?: any;
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  maxWidth?: number;
  maxHeight?: number;
}

// Upload single image
export const uploadImage = async (
  filePath: string, 
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const {
      folder = 'services-hub',
      transformation = {},
      quality = 'auto',
      format = 'auto',
      maxWidth = 1920,
      maxHeight = 1080
    } = options;

    const uploadOptions = {
      folder,
      quality,
      format,
      transformation: {
        width: maxWidth,
        height: maxHeight,
        crop: 'limit',
        ...transformation
      },
      resource_type: 'image' as const
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    throw new AppError('Failed to upload image', 500, 'UPLOAD_FAILED');
  }
};

// Upload image from buffer
export const uploadImageFromBuffer = async (
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const {
      folder = 'services-hub',
      transformation = {},
      quality = 'auto',
      format = 'auto',
      maxWidth = 1920,
      maxHeight = 1080
    } = options;

    const uploadOptions = {
      folder,
      quality,
      format,
      transformation: {
        width: maxWidth,
        height: maxHeight,
        crop: 'limit',
        ...transformation
      },
      resource_type: 'image' as const
    };

    const result = await cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) throw error;
        return result;
      }
    ).end(buffer);

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    throw new AppError('Failed to upload image from buffer', 500, 'UPLOAD_FAILED');
  }
};

// Upload multiple images
export const uploadMultipleImages = async (
  filePaths: string[],
  options: UploadOptions = {}
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = filePaths.map(filePath => uploadImage(filePath, options));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new AppError('Failed to upload multiple images', 500, 'UPLOAD_FAILED');
  }
};

// Delete image
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new AppError('Failed to delete image', 500, 'DELETE_FAILED');
  }
};

// Delete multiple images
export const deleteMultipleImages = async (publicIds: string[]): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicIds.join(','));
  } catch (error) {
    throw new AppError('Failed to delete images', 500, 'DELETE_FAILED');
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
    crop?: string;
    gravity?: string;
  } = {}
): string => {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    gravity = 'auto'
  } = options;

  const transformation: any = {};
  
  if (width) transformation.width = width;
  if (height) transformation.height = height;
  if (quality) transformation.quality = quality;
  if (format) transformation.format = format;
  if (crop) transformation.crop = crop;
  if (gravity) transformation.gravity = gravity;

  return cloudinary.url(publicId, {
    transformation: [transformation],
    secure: true
  });
};

// Generate responsive image URLs
export const getResponsiveImageUrls = (publicId: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
} => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    small: getOptimizedImageUrl(publicId, { width: 400, height: 300, crop: 'limit' }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 600, crop: 'limit' }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 900, crop: 'limit' }),
    original: getOptimizedImageUrl(publicId)
  };
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  try {
    const matches = url.match(/\/v\d+\/(.+?)\./);
    return matches ? matches[1] : null;
  } catch (error) {
    return null;
  }
};

// Check if URL is a Cloudinary URL
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com');
};

// Get image info
export const getImageInfo = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.api.resource(publicId);
  } catch (error) {
    throw new AppError('Failed to get image info', 500, 'INFO_FAILED');
  }
};

// Create image transformation
export const createTransformation = (options: {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  effect?: string;
  radius?: number;
  border?: string;
}): any => {
  return cloudinary.utils.transformation_string(options);
};

export default {
  uploadImage,
  uploadImageFromBuffer,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  extractPublicId,
  isCloudinaryUrl,
  getImageInfo,
  createTransformation
};
