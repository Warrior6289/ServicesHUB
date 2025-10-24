import mongoose, { Schema } from 'mongoose';
import { ISellerProfile, ISellerProfileCreate } from '../types';

// Location sub-schema
const locationSchema = new Schema({
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  coordinates: {
    type: [Number],
    required: [true, 'Coordinates are required'],
    validate: {
      validator: function(coords: number[]) {
        return coords.length === 2 && 
               coords[0] >= -180 && coords[0] <= 180 && // longitude
               coords[1] >= -90 && coords[1] <= 90;    // latitude
      },
      message: 'Invalid coordinates format'
    }
  }
}, { _id: false });

// Seller Profile Schema
const sellerProfileSchema = new Schema<ISellerProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    trim: true,
    minlength: [50, 'Bio must be at least 50 characters'],
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  location: {
    type: locationSchema,
    required: [true, 'Location is required']
  },
  serviceCategories: [{
    type: String,
    required: [true, 'At least one service category is required'],
    enum: {
      values: [
        'Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Carpentry',
        'Landscaping', 'Painting', 'Flooring', 'Roofing', 'Appliance Repair',
        'Handyman', 'Moving', 'Pet Care', 'Tutoring', 'Photography',
        'Event Planning', 'Personal Training', 'Beauty Services', 'IT Support', 'Legal Services'
      ],
      message: 'Invalid service category'
    }
  }],
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience cannot exceed 50']
  },
  certifications: [{
    type: String,
    trim: true,
    maxlength: [100, 'Certification name cannot exceed 100 characters']
  }],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewsCount: {
    type: Number,
    default: 0,
    min: [0, 'Reviews count cannot be negative']
  },
  completedJobs: {
    type: Number,
    default: 0,
    min: [0, 'Completed jobs cannot be negative']
  },
  availability: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: null,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Allow null/empty
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url);
      },
      message: 'Profile picture must be a valid image URL'
    }
  },
  portfolio: [{
    type: String,
    validate: {
      validator: function(url: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url);
      },
      message: 'Portfolio image must be a valid image URL'
    }
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
sellerProfileSchema.index({ userId: 1 });
sellerProfileSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index
sellerProfileSchema.index({ serviceCategories: 1 });
sellerProfileSchema.index({ rating: -1 });
sellerProfileSchema.index({ availability: 1 });
sellerProfileSchema.index({ isApproved: 1 });
sellerProfileSchema.index({ createdAt: -1 });

// Virtual for average rating calculation
sellerProfileSchema.virtual('averageRating').get(function() {
  return this.reviewsCount > 0 ? (this.rating / this.reviewsCount) : 0;
});

// Virtual for profile completion percentage
sellerProfileSchema.virtual('completionPercentage').get(function() {
  let completed = 0;
  const total = 7; // Total required fields
  
  if (this.bio) completed++;
  if (this.location && this.location.address && this.location.coordinates) completed++;
  if (this.serviceCategories && this.serviceCategories.length > 0) completed++;
  if (this.yearsOfExperience !== undefined) completed++;
  if (this.certifications && this.certifications.length > 0) completed++;
  if (this.profilePicture) completed++;
  if (this.portfolio && this.portfolio.length > 0) completed++;
  
  return Math.round((completed / total) * 100);
});

// Pre-save middleware
sellerProfileSchema.pre('save', function(next) {
  // Update approval timestamp when approved
  if (this.isModified('isApproved') && this.isApproved && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  next();
});

// Static method to find sellers by category
sellerProfileSchema.statics.findByCategory = function(category: string) {
  return this.find({ 
    serviceCategories: category,
    isApproved: true,
    availability: true
  }).populate('userId', 'name email phone avatar');
};

// Static method to find nearby sellers
sellerProfileSchema.statics.findNearby = function(coordinates: [number, number], radius: number = 50) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    },
    isApproved: true,
    availability: true
  }).populate('userId', 'name email phone avatar');
};

// Static method to find top-rated sellers
sellerProfileSchema.statics.findTopRated = function(limit: number = 10) {
  return this.find({
    isApproved: true,
    availability: true,
    reviewsCount: { $gte: 5 } // At least 5 reviews
  })
  .sort({ rating: -1, reviewsCount: -1 })
  .limit(limit)
  .populate('userId', 'name email phone avatar');
};

// Instance method to update rating
sellerProfileSchema.methods.updateRating = function(newRating: number) {
  const totalRating = (this.rating * this.reviewsCount) + newRating;
  this.reviewsCount += 1;
  this.rating = totalRating / this.reviewsCount;
  return this.save();
};

// Instance method to add portfolio image
sellerProfileSchema.methods.addPortfolioImage = function(imageUrl: string) {
  this.portfolio.push(imageUrl);
  return this.save();
};

// Instance method to remove portfolio image
sellerProfileSchema.methods.removePortfolioImage = function(imageUrl: string) {
  this.portfolio = this.portfolio.filter((url: string) => url !== imageUrl);
  return this.save();
};

export const SellerProfile = mongoose.model<ISellerProfile>('SellerProfile', sellerProfileSchema);

// Seller profile creation helper
export const createSellerProfile = async (profileData: ISellerProfileCreate): Promise<ISellerProfile> => {
  try {
    const profile = new SellerProfile(profileData);
    await profile.save();
    return profile;
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      throw new Error('Seller profile already exists for this user');
    }
    throw error;
  }
};

// Seller profile update helper
export const updateSellerProfile = async (userId: string, updateData: Partial<ISellerProfile>): Promise<ISellerProfile | null> => {
  try {
    const profile = await SellerProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone avatar');
    return profile;
  } catch (error) {
    throw error;
  }
};

// Get seller profile by user ID
export const getSellerProfileByUserId = async (userId: string): Promise<ISellerProfile | null> => {
  try {
    return await SellerProfile.findOne({ userId }).populate('userId', 'name email phone avatar');
  } catch (error) {
    throw error;
  }
};

export default SellerProfile;
