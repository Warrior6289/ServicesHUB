import mongoose, { Schema } from 'mongoose';
import { ITransaction, ITransactionCreate } from '../types';

// Transaction Schema
const transactionSchema = new Schema<ITransaction>({
  serviceRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: [true, 'Service request ID is required']
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    max: [10000, 'Amount cannot exceed $10,000']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['card', 'bank_transfer', 'paypal', 'stripe'],
      message: 'Invalid payment method'
    }
  },
  stripePaymentIntentId: {
    type: String,
    trim: true,
    validate: {
      validator: function(id: string) {
        if (!id) return true; // Allow null/empty
        return /^pi_[a-zA-Z0-9]+$/.test(id);
      },
      message: 'Invalid Stripe payment intent ID format'
    }
  },
  stripeChargeId: {
    type: String,
    trim: true,
    validate: {
      validator: function(id: string) {
        if (!id) return true; // Allow null/empty
        return /^ch_[a-zA-Z0-9]+$/.test(id);
      },
      message: 'Invalid Stripe charge ID format'
    }
  },
  refundedAt: {
    type: Date,
    default: null
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Refund reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
transactionSchema.index({ serviceRequestId: 1 });
transactionSchema.index({ buyerId: 1 });
transactionSchema.index({ sellerId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ stripePaymentIntentId: 1 });
transactionSchema.index({ stripeChargeId: 1 });

// Compound indexes
transactionSchema.index({ buyerId: 1, status: 1 });
transactionSchema.index({ sellerId: 1, status: 1 });
transactionSchema.index({ serviceRequestId: 1, status: 1 });

// Virtual for transaction fee (platform fee)
transactionSchema.virtual('platformFee').get(function() {
  // Platform takes 5% fee
  return Math.round(this.amount * 0.05 * 100) / 100;
});

// Virtual for seller payout amount
transactionSchema.virtual('sellerPayout').get(function() {
  return this.amount - this.platformFee;
});

// Virtual for is refundable
transactionSchema.virtual('isRefundable').get(function() {
  return this.status === 'completed' && !this.refundedAt;
});

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Set refund timestamp when status changes to refunded
  if (this.isModified('status') && this.status === 'refunded' && !this.refundedAt) {
    this.refundedAt = new Date();
  }
  next();
});

// Static method to find transactions by buyer
transactionSchema.statics.findByBuyer = function(buyerId: string, status?: string) {
  const query: any = { buyerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('serviceRequestId', 'category description')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find transactions by seller
transactionSchema.statics.findBySeller = function(sellerId: string, status?: string) {
  const query: any = { sellerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('serviceRequestId', 'category description')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find transactions by service request
transactionSchema.statics.findByServiceRequest = function(serviceRequestId: string) {
  return this.find({ serviceRequestId })
    .populate('serviceRequestId', 'category description')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get transaction statistics
transactionSchema.statics.getStats = function(sellerId?: string, buyerId?: string) {
  const match: any = {};
  if (sellerId) match.sellerId = sellerId;
  if (buyerId) match.buyerId = buyerId;
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalPlatformFee: { $sum: { $multiply: ['$amount', 0.05] } },
        totalSellerPayout: { $sum: { $multiply: ['$amount', 0.95] } },
        completedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        refundedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
        },
        averageTransactionAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Instance method to mark as completed
transactionSchema.methods.markCompleted = function(stripeChargeId?: string) {
  this.status = 'completed';
  if (stripeChargeId) {
    this.stripeChargeId = stripeChargeId;
  }
  return this.save();
};

// Instance method to process refund
transactionSchema.methods.processRefund = function(reason: string) {
  if (this.status !== 'completed') {
    throw new Error('Only completed transactions can be refunded');
  }
  
  if (this.refundedAt) {
    throw new Error('Transaction has already been refunded');
  }
  
  this.status = 'refunded';
  this.refundReason = reason;
  this.refundedAt = new Date();
  
  return this.save();
};

// Instance method to mark as failed
transactionSchema.methods.markFailed = function() {
  this.status = 'failed';
  return this.save();
};

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

// Transaction creation helper
export const createTransaction = async (transactionData: ITransactionCreate): Promise<ITransaction> => {
  try {
    const transaction = new Transaction(transactionData);
    await transaction.save();
    return transaction;
  } catch (error) {
    throw error;
  }
};

// Transaction update helper
export const updateTransaction = async (transactionId: string, updateData: Partial<ITransaction>): Promise<ITransaction | null> => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('serviceRequestId', 'category description')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name email');
    
    return transaction;
  } catch (error) {
    throw error;
  }
};

// Get transaction by ID
export const getTransactionById = async (transactionId: string): Promise<ITransaction | null> => {
  try {
    return await Transaction.findById(transactionId)
      .populate('serviceRequestId', 'category description')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email');
  } catch (error) {
    throw error;
  }
};

// Get transaction by Stripe payment intent ID
export const getTransactionByPaymentIntentId = async (paymentIntentId: string): Promise<ITransaction | null> => {
  try {
    return await Transaction.findOne({ stripePaymentIntentId: paymentIntentId })
      .populate('serviceRequestId', 'category description')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email');
  } catch (error) {
    throw error;
  }
};

export default Transaction;
