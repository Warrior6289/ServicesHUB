export type ServiceRequestType = 'instant' | 'scheduled';

export type ServiceRequestStatus = 
  | 'pending'
  | 'price_boosted'
  | 'converted_to_scheduled'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type Location = {
  lat: number;
  lng: number;
  address: string;
};

export type PriceHistoryEntry = {
  price: number;
  timestamp: string;
};

export type ServiceRequest = {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerLocation: Location;
  categoryId: string;
  categoryName: string;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  description: string;
  initialPrice: number;
  currentPrice: number;
  priceHistory: PriceHistoryEntry[];
  
  // Instant request specific
  broadcastRadius?: number; // in km
  expiresAt?: string; // ISO timestamp
  
  // Scheduled request specific
  preferredSellerId?: string;
  scheduledDate?: string; // ISO timestamp
  scheduledTimeSlot?: string; // e.g., "9:00 AM - 11:00 AM"
  
  // After acceptance
  acceptedBy?: string; // Seller ID
  acceptedAt?: string; // ISO timestamp
  
  createdAt: string;
  updatedAt: string;
};

export type CreateInstantRequestPayload = {
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  location: Location;
  broadcastRadius: number;
};

export type CreateScheduledRequestPayload = {
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  location: Location;
  scheduledDate: string;
  scheduledTimeSlot: string;
  preferredSellerId?: string;
};

