import mongoose, { Schema } from 'mongoose';
import { IServiceRequest, IServiceRequestCreate } from '../types';

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

// Price history sub-schema
const priceHistorySchema = new Schema({
  amount: {
    type: Number,
    required: [true, 'Price amount is required'],
    min: [0, 'Price cannot be negative']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  boostedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { _id: false });

// Service Request Schema
const serviceRequestSchema = new Schema<IServiceRequest>({
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Carpentry',
        'Landscaping', 'Painting', 'Flooring', 'Roofing', 'Appliance Repair',
        'Handyman', 'Moving', 'Pet Care', 'Tutoring', 'Photography',
        'Event Planning', 'Personal Training', 'Beauty Services', 'IT Support', 'Legal Services'
      ],
      message: 'Invalid service category'
    }
  },
  type: {
    type: String,
    required: [true, 'Request type is required'],
    enum: {
      values: ['instant', 'scheduled'],
      message: 'Request type must be either instant or scheduled'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least $1'],
    max: [10000, 'Price cannot exceed $10,000']
  },
  priceHistory: [priceHistorySchema],
  location: {
    type: locationSchema,
    required: [true, 'Location is required']
  },
  status: {
    type: String,
    enum: ['pending', 'price_boosted', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        if (this.type === 'scheduled' && !date) {
          return false;
        }
        if (date && date < new Date()) {
          return false;
        }
        return true;
      },
      message: 'Scheduled date is required for scheduled requests and must be in the future'
    }
  },
  scheduledTime: {
    type: String,
    validate: {
      validator: function(time: string) {
        if (this.type === 'scheduled' && !time) {
          return false;
        }
        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
          return false;
        }
        return true;
      },
      message: 'Scheduled time is required for scheduled requests and must be in HH:MM format'
    }
  },
  broadcastRadius: {
    type: Number,
    min: [1, 'Broadcast radius must be at least 1 km'],
    max: [100, 'Broadcast radius cannot exceed 100 km'],
    validate: {
      validator: function(radius: number) {
        if (this.type === 'instant' && !radius) {
          return false;
        }
        return true;
      },
      message: 'Broadcast radius is required for instant requests'
    }
  },
  expiresAt: {
    type: Date,
    default: function() {
      if (this.type === 'instant') {
        return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      }
      return null;
    }
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
serviceRequestSchema.index({ buyerId: 1 });
serviceRequestSchema.index({ sellerId: 1 });
serviceRequestSchema.index({ category: 1 });
serviceRequestSchema.index({ type: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ expiresAt: 1 });
serviceRequestSchema.index({ scheduledDate: 1 });

// Compound indexes
serviceRequestSchema.index({ category: 1, status: 1 });
serviceRequestSchema.index({ type: 1, status: 1 });
serviceRequestSchema.index({ buyerId: 1, status: 1 });
serviceRequestSchema.index({ sellerId: 1, status: 1 });

// Virtual for time remaining (for instant requests)
serviceRequestSchema.virtual('timeRemaining').get(function() {
  if (this.type === 'instant' && this.expiresAt && this.status === 'pending') {
    const now = new Date();
    const remaining = this.expiresAt.getTime() - now.getTime();
    return remaining > 0 ? remaining : 0;
  }
  return null;
});

// Virtual for is expired
serviceRequestSchema.virtual('isExpired').get(function() {
  if (this.expiresAt) {
    return new Date() > this.expiresAt;
  }
  return false;
});

// Virtual for price increase percentage
serviceRequestSchema.virtual('priceIncreasePercentage').get(function() {
  if (this.priceHistory.length > 1) {
    const originalPrice = this.priceHistory[0].amount;
    const currentPrice = this.price;
    return Math.round(((currentPrice - originalPrice) / originalPrice) * 100);
  }
  return 0;
});

// Pre-save middleware
serviceRequestSchema.pre('save', function(next) {
  // Add initial price to price history if it's a new document
  if (this.isNew && this.priceHistory.length === 0) {
    this.priceHistory.push({
      amount: this.price,
      timestamp: new Date()
    });
  }

  // Set completion timestamp when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }

  // Set cancellation timestamp when status changes to cancelled
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }

  next();
});

// Static method to find requests by buyer
serviceRequestSchema.statics.findByBuyer = function(buyerId: string, status?: string) {
  const query: any = { buyerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('buyerId', 'name email phone')
    .populate('sellerId', 'name email phone')
    .sort({ createdAt: -1 });
};

// Static method to find requests by seller
serviceRequestSchema.statics.findBySeller = function(sellerId: string, status?: string) {
  const query: any = { sellerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('buyerId', 'name email phone')
    .populate('sellerId', 'name email phone')
    .sort({ createdAt: -1 });
};

// Static method to find nearby instant requests
serviceRequestSchema.statics.findNearbyInstant = function(coordinates: [number, number], radius: number = 50) {
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
    type: 'instant',
    status: { $in: ['pending', 'price_boosted'] },
    expiresAt: { $gt: new Date() }
  })
  .populate('buyerId', 'name email phone')
  .sort({ createdAt: -1 });
};

// Static method to find expired requests
serviceRequestSchema.statics.findExpired = function() {
  return this.find({
    expiresAt: { $lt: new Date() },
    status: { $in: ['pending', 'price_boosted'] }
  });
};

// Instance method to boost price
serviceRequestSchema.methods.boostPrice = function(newPrice: number, boostedBy: string) {
  if (newPrice <= this.price) {
    throw new Error('New price must be higher than current price');
  }
  
  this.price = newPrice;
  this.priceHistory.push({
    amount: newPrice,
    timestamp: new Date(),
    boostedBy: boostedBy
  });
  
  if (this.status === 'pending') {
    this.status = 'price_boosted';
  }
  
  return this.save();
};

// Instance method to accept request
serviceRequestSchema.methods.acceptRequest = function(sellerId: string) {
  if (this.sellerId) {
    throw new Error('Request has already been accepted');
  }
  
  this.sellerId = sellerId;
  this.status = 'accepted';
  return this.save();
};

// Instance method to update status
serviceRequestSchema.methods.updateStatus = function(newStatus: string, reason?: string) {
  this.status = newStatus;
  
  if (newStatus === 'cancelled' && reason) {
    this.cancellationReason = reason;
  }
  
  return this.save();
};

export const ServiceRequest = mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);

// Service request creation helper
export const createServiceRequest = async (requestData: IServiceRequestCreate): Promise<IServiceRequest> => {
  try {
    const request = new ServiceRequest(requestData);
    await request.save();
    return request;
  } catch (error) {
    throw error;
  }
};

// Service request update helper
export const updateServiceRequest = async (requestId: string, updateData: Partial<IServiceRequest>): Promise<IServiceRequest | null> => {
  try {
    const request = await ServiceRequest.findByIdAndUpdate(
      requestId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('buyerId', 'name email phone')
    .populate('sellerId', 'name email phone');
    
    return request;
  } catch (error) {
    throw error;
  }
};

// Get service request by ID
export const getServiceRequestById = async (requestId: string): Promise<IServiceRequest | null> => {
  try {
    return await ServiceRequest.findById(requestId)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone');
  } catch (error) {
    throw error;
  }
};

export default ServiceRequest;
