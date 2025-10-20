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
    return data as SellerProfile[];
  } catch (error) {
    // Return mock data for development
    console.warn('API not available, returning mock sellers for category:', categoryId);
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
        completedJobs: 450
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
        completedJobs: 320
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
        completedJobs: 680
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
        completedJobs: 280
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
        completedJobs: 190
      }
    ]
  };
  
  return mockSellers[categoryId.toLowerCase()] || [];
}


