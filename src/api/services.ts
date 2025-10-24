import { api } from './client';
import type { SellerProfile } from '../types/seller';

export async function fetchHomepageServices() {
  const { data } = await api.get('/services/home');
  return data as Array<{ id: string; title: string; rating: number; description?: string }>;
}

export async function fetchUserPurchased() {
  const { data } = await api.get('/user/purchases');
  return data as Array<{ id: string; name: string; price: number; provider: string; date: string; rating?: number; review?: string }>;
}

export async function submitServiceReview(serviceId: string, rating: number, review: string) {
  const { data } = await api.post(`/services/${serviceId}/reviews`, { rating, review });
  return data;
}

export async function fetchSellerListings() {
  const { data } = await api.get('/seller/listings');
  return data as Array<{ id: string; title: string; price: number; status: 'available'|'sold'; views: number; rating: number; description?: string }>;
}

export async function createListing(payload: { title: string; price: number; description?: string }) {
  const { data } = await api.post('/seller/listings', payload);
  return data;
}

export async function updateListing(id: string, payload: { title?: string; price?: number; description?: string }) {
  const { data } = await api.patch(`/seller/listings/${id}`, payload);
  return data;
}

export async function removeListing(id: string) {
  const { data } = await api.delete(`/seller/listings/${id}`);
  return data;
}

export async function fetchSellersByCategory(categoryId: string): Promise<SellerProfile[]> {
  try {
    const { data } = await api.get(`/categories/${categoryId}/sellers`);
    // Ensure the response is an array
    if (Array.isArray(data)) {
    return data as SellerProfile[];
    } else {
      // API returned unexpected data format, using fallback
      return getMockSellersByCategory(categoryId);
    }
  } catch (error) {
    // Return mock data for development
    // API not available, using mock data for development
    return getMockSellersByCategory(categoryId);
  }
}

function getMockSellersByCategory(categoryId: string): SellerProfile[] {
  const mockSellers: Record<string, SellerProfile[]> = {
    'plumber': [
      {
        id: 'p1',
        name: 'Mike Johnson',
        rating: 4.8,
        reviewsCount: 127,
        serviceDescription: 'Professional plumbing services with 15+ years experience. Specializing in emergency repairs, installations, and maintenance.',
        portfolioImages: ['https://picsum.photos/id/1011/400/300', 'https://picsum.photos/id/1012/400/300'],
        pricing: '$75-150/hour',
        availability: 'Available today',
        verified: true,
        category: 'plumber',
        location: 'Downtown',
        responseTime: '< 2 hours',
        completedJobs: 450,
        serviceCategories: ['Plumber']
      },
      {
        id: 'p2',
        name: 'Sarah Chen',
        rating: 4.6,
        reviewsCount: 89,
        serviceDescription: 'Licensed plumber offering residential and commercial services. Eco-friendly solutions available.',
        portfolioImages: ['https://picsum.photos/id/1013/400/300'],
        pricing: '$65-120/hour',
        availability: 'Available tomorrow',
        verified: true,
        category: 'plumber',
        location: 'Westside',
        responseTime: '< 4 hours',
        completedJobs: 320,
        serviceCategories: ['Plumber']
      }
    ],
    'electrician': [
      {
        id: 'e1',
        name: 'David Rodriguez',
        rating: 4.9,
        reviewsCount: 203,
        serviceDescription: 'Master electrician with expertise in residential wiring, panel upgrades, and smart home installations.',
        portfolioImages: ['https://picsum.photos/id/1021/400/300', 'https://picsum.photos/id/1022/400/300'],
        pricing: '$85-180/hour',
        availability: 'Available today',
        verified: true,
        category: 'electrician',
        location: 'Northside',
        responseTime: '< 1 hour',
        completedJobs: 680,
        serviceCategories: ['Electrician']
      }
    ],
    'welder': [
      {
        id: 'w1',
        name: 'Tom Wilson',
        rating: 4.7,
        reviewsCount: 156,
        serviceDescription: 'Certified welder specializing in automotive, structural, and artistic metalwork. Mobile service available.',
        portfolioImages: ['https://picsum.photos/id/1031/400/300'],
        pricing: '$90-200/hour',
        availability: 'Available tomorrow',
        verified: true,
        category: 'welder',
        location: 'Industrial District',
        responseTime: '< 6 hours',
        completedJobs: 280,
        serviceCategories: ['Welder']
      }
    ],
    'carpenter': [
      {
        id: 'c1',
        name: 'Lisa Anderson',
        rating: 4.5,
        reviewsCount: 94,
        serviceDescription: 'Skilled carpenter offering custom furniture, repairs, and home improvement projects.',
        portfolioImages: ['https://picsum.photos/id/1041/400/300', 'https://picsum.photos/id/1042/400/300'],
        pricing: '$70-140/hour',
        availability: 'Available today',
        verified: true,
        category: 'carpenter',
        location: 'Eastside',
        responseTime: '< 3 hours',
        completedJobs: 190,
        serviceCategories: ['Carpenter']
      }
    ],
    'technician': [
      {
        id: 't1',
        name: 'Alex Kim',
        rating: 4.6,
        reviewsCount: 78,
        serviceDescription: 'Certified technician specializing in appliance repair and diagnostics.',
        portfolioImages: ['https://picsum.photos/id/1051/400/300'],
        pricing: '$60-130/hour',
        availability: 'Available today',
        verified: true,
        category: 'technician',
        location: 'Central',
        responseTime: '< 2 hours',
        completedJobs: 240,
        serviceCategories: ['Technician', 'Appliance Repair']
      }
    ],
    'painter': [
      {
        id: 'pt1',
        name: 'Maria Garcia',
        rating: 4.7,
        reviewsCount: 112,
        serviceDescription: 'Professional painter with expertise in interior and exterior painting.',
        portfolioImages: ['https://picsum.photos/id/1061/400/300', 'https://picsum.photos/id/1062/400/300'],
        pricing: '$50-120/hour',
        availability: 'Available tomorrow',
        verified: true,
        category: 'painter',
        location: 'Southside',
        responseTime: '< 4 hours',
        completedJobs: 180,
        serviceCategories: ['Painter']
      }
    ],
    'hvac': [
      {
        id: 'h1',
        name: 'Robert Taylor',
        rating: 4.8,
        reviewsCount: 145,
        serviceDescription: 'HVAC specialist providing heating, ventilation, and air conditioning services.',
        portfolioImages: ['https://picsum.photos/id/1071/400/300'],
        pricing: '$80-160/hour',
        availability: 'Available today',
        verified: true,
        category: 'hvac',
        location: 'Northside',
        responseTime: '< 2 hours',
        completedJobs: 320,
        serviceCategories: ['HVAC']
      }
    ],
    'cleaning': [
      {
        id: 'cl1',
        name: 'Jennifer White',
        rating: 4.4,
        reviewsCount: 89,
        serviceDescription: 'Professional cleaning services for homes and offices.',
        portfolioImages: ['https://picsum.photos/id/1081/400/300'],
        pricing: '$25-50/hour',
        availability: 'Available today',
        verified: true,
        category: 'cleaning',
        location: 'Downtown',
        responseTime: '< 1 hour',
        completedJobs: 150,
        serviceCategories: ['Cleaning']
      }
    ]
  };
  
  // Return specific mock data if available, otherwise return generic mock data
  const specificMockData = mockSellers[categoryId.toLowerCase()];
  if (specificMockData) {
    return specificMockData;
  }
  
  // Generic mock data for any category not specifically defined
  return [
    {
      id: `generic-${categoryId}-1`,
      name: `Professional ${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}`,
      rating: 4.5,
      reviewsCount: 85,
      serviceDescription: `Experienced ${categoryId} professional providing quality services with attention to detail.`,
      portfolioImages: ['https://picsum.photos/id/2001/400/300'],
      pricing: '$60-120/hour',
      availability: 'Available today',
      verified: true,
      category: categoryId,
      location: 'Local Area',
      responseTime: '< 3 hours',
      completedJobs: 150,
      serviceCategories: [categoryId.charAt(0).toUpperCase() + categoryId.slice(1)]
    },
    {
      id: `generic-${categoryId}-2`,
      name: `Expert ${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Services`,
      rating: 4.3,
      reviewsCount: 67,
      serviceDescription: `Reliable ${categoryId} services with competitive pricing and excellent customer satisfaction.`,
      portfolioImages: ['https://picsum.photos/id/2002/400/300'],
      pricing: '$50-110/hour',
      availability: 'Available tomorrow',
      verified: true,
      category: categoryId,
      location: 'Nearby',
      responseTime: '< 4 hours',
      completedJobs: 120,
      serviceCategories: [categoryId.charAt(0).toUpperCase() + categoryId.slice(1)]
    }
  ];
}


