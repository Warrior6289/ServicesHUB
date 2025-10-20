import type { ServiceRequest } from '../types/serviceRequest';

// Mock locations in a fictitious city area
const mockLocations = [
  { lat: 40.7128, lng: -74.0060, address: '123 Main St, New York, NY 10001' },
  { lat: 40.7580, lng: -73.9855, address: '456 Park Ave, New York, NY 10022' },
  { lat: 40.7489, lng: -73.9680, address: '789 Broadway, New York, NY 10003' },
  { lat: 40.7614, lng: -73.9776, address: '321 5th Ave, New York, NY 10016' },
  { lat: 40.7282, lng: -73.7949, address: '654 Queens Blvd, Queens, NY 11375' },
  { lat: 40.6782, lng: -73.9442, address: '987 Atlantic Ave, Brooklyn, NY 11238' },
];

const categories = [
  { id: 'plumber', name: 'Plumber' },
  { id: 'electrician', name: 'Electrician' },
  { id: 'welder', name: 'Welder' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'hvac', name: 'HVAC' },
  { id: 'painter', name: 'Painter' },
];

const descriptions = [
  'Emergency leak in kitchen sink, need immediate help',
  'Installing new ceiling fan in living room',
  'Metal gate repair needed for front entrance',
  'Custom bookshelf installation required',
  'AC not cooling properly, needs inspection',
  'Bathroom plumbing issue, toilet won\'t flush',
  'Need electrical outlet installed in garage',
  'Welding work for metal railings',
  'Kitchen cabinet repair and adjustment',
  'Annual HVAC maintenance and cleaning',
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(daysAgo: number, daysAhead: number): string {
  const now = Date.now();
  const min = now - (daysAgo * 24 * 60 * 60 * 1000);
  const max = now + (daysAhead * 24 * 60 * 60 * 1000);
  return new Date(min + Math.random() * (max - min)).toISOString();
}

function createMockRequest(
  id: string,
  type: 'instant' | 'scheduled',
  status: ServiceRequest['status']
): ServiceRequest {
  const category = randomItem(categories);
  const location = randomItem(mockLocations);
  const initialPrice = Math.round((50 + Math.random() * 200) * 100) / 100;
  const createdAt = randomDate(5, 0);
  const currentPrice = status === 'price_boosted' 
    ? Math.round((initialPrice * 1.2 + Math.random() * 50) * 100) / 100
    : initialPrice;

  const baseRequest: ServiceRequest = {
    id,
    buyerId: `buyer_${Math.random().toString(36).slice(2, 9)}`,
    buyerName: randomItem(['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams', 'Carol Brown']),
    buyerLocation: location,
    categoryId: category.id,
    categoryName: category.name,
    type,
    status,
    description: randomItem(descriptions),
    initialPrice,
    currentPrice,
    priceHistory: status === 'price_boosted' 
      ? [
          { price: initialPrice, timestamp: createdAt },
          { price: currentPrice, timestamp: new Date(new Date(createdAt).getTime() + 15 * 60 * 1000).toISOString() }
        ]
      : [{ price: initialPrice, timestamp: createdAt }],
    createdAt,
    updatedAt: status === 'price_boosted' 
      ? new Date(new Date(createdAt).getTime() + 15 * 60 * 1000).toISOString()
      : createdAt,
  };

  if (type === 'instant') {
    baseRequest.broadcastRadius = 5 + Math.floor(Math.random() * 45); // 5-50 km
    baseRequest.expiresAt = new Date(new Date(createdAt).getTime() + 60 * 60 * 1000).toISOString(); // 1 hour
  } else {
    baseRequest.scheduledDate = randomDate(0, 7);
    baseRequest.scheduledTimeSlot = randomItem([
      '9:00 AM - 11:00 AM',
      '11:00 AM - 1:00 PM',
      '1:00 PM - 3:00 PM',
      '3:00 PM - 5:00 PM',
      '5:00 PM - 7:00 PM',
    ]);
  }

  if (['accepted', 'in_progress', 'completed'].includes(status)) {
    baseRequest.acceptedBy = `seller_${Math.random().toString(36).slice(2, 9)}`;
    baseRequest.acceptedAt = new Date(new Date(createdAt).getTime() + 30 * 60 * 1000).toISOString();
  }

  return baseRequest;
}

export const mockServiceRequests: ServiceRequest[] = [
  createMockRequest('req_1', 'instant', 'pending'),
  createMockRequest('req_2', 'instant', 'pending'),
  createMockRequest('req_3', 'instant', 'price_boosted'),
  createMockRequest('req_4', 'instant', 'accepted'),
  createMockRequest('req_5', 'instant', 'in_progress'),
  createMockRequest('req_6', 'scheduled', 'pending'),
  createMockRequest('req_7', 'scheduled', 'accepted'),
  createMockRequest('req_8', 'scheduled', 'completed'),
  createMockRequest('req_9', 'instant', 'completed'),
  createMockRequest('req_10', 'scheduled', 'cancelled'),
];

// Helper to get requests by status
export function getMockRequestsByStatus(status: ServiceRequest['status']): ServiceRequest[] {
  return mockServiceRequests.filter(req => req.status === status);
}

// Helper to get instant requests only
export function getMockInstantRequests(): ServiceRequest[] {
  return mockServiceRequests.filter(req => req.type === 'instant' && ['pending', 'price_boosted'].includes(req.status));
}

// Helper to get user requests (buyer perspective)
export function getMockUserRequests(limit?: number): ServiceRequest[] {
  const requests = [...mockServiceRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return limit ? requests.slice(0, limit) : requests;
}

// Helper to get seller requests
export function getMockSellerRequests(): ServiceRequest[] {
  return mockServiceRequests.filter(req => 
    ['accepted', 'in_progress', 'completed'].includes(req.status)
  );
}

