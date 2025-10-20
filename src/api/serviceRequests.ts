import { api } from './client';
import type { 
  ServiceRequest, 
  CreateInstantRequestPayload, 
  CreateScheduledRequestPayload,
  ServiceRequestStatus
} from '../types/serviceRequest';

// Buyer APIs
export async function createInstantRequest(payload: CreateInstantRequestPayload): Promise<ServiceRequest> {
  try {
    const { data } = await api.post('/service-requests/instant', payload);
    return data as ServiceRequest;
  } catch (error) {
    console.error('Failed to create instant request:', error);
    throw error;
  }
}

export async function createScheduledRequest(payload: CreateScheduledRequestPayload): Promise<ServiceRequest> {
  try {
    const { data } = await api.post('/service-requests/scheduled', payload);
    return data as ServiceRequest;
  } catch (error) {
    console.error('Failed to create scheduled request:', error);
    throw error;
  }
}

export async function boostRequestPrice(requestId: string, newPrice: number): Promise<ServiceRequest> {
  try {
    const { data } = await api.patch(`/service-requests/${requestId}/boost-price`, { newPrice });
    return data as ServiceRequest;
  } catch (error) {
    console.error('Failed to boost request price:', error);
    throw error;
  }
}

export async function getUserRequests(): Promise<ServiceRequest[]> {
  try {
    const { data } = await api.get('/service-requests/user');
    return data as ServiceRequest[];
  } catch (error) {
    console.error('Failed to fetch user requests:', error);
    throw error;
  }
}

export async function cancelRequest(requestId: string): Promise<void> {
  try {
    await api.patch(`/service-requests/${requestId}/cancel`);
  } catch (error) {
    console.error('Failed to cancel request:', error);
    throw error;
  }
}

// Seller APIs
export async function getNearbyInstantRequests(radius: number, categoryId?: string): Promise<ServiceRequest[]> {
  try {
    const params = new URLSearchParams();
    params.append('radius', radius.toString());
    if (categoryId) params.append('categoryId', categoryId);
    
    const { data } = await api.get(`/service-requests/nearby?${params.toString()}`);
    return data as ServiceRequest[];
  } catch (error) {
    console.error('Failed to fetch nearby requests:', error);
    throw error;
  }
}

export async function acceptRequest(requestId: string): Promise<ServiceRequest> {
  try {
    const { data } = await api.post(`/service-requests/${requestId}/accept`);
    return data as ServiceRequest;
  } catch (error) {
    console.error('Failed to accept request:', error);
    throw error;
  }
}

export async function getSellerRequests(): Promise<ServiceRequest[]> {
  try {
    const { data } = await api.get('/service-requests/seller');
    return data as ServiceRequest[];
  } catch (error) {
    console.error('Failed to fetch seller requests:', error);
    throw error;
  }
}

export async function updateRequestStatus(requestId: string, status: ServiceRequestStatus): Promise<ServiceRequest> {
  try {
    const { data } = await api.patch(`/service-requests/${requestId}/status`, { status });
    return data as ServiceRequest;
  } catch (error) {
    console.error('Failed to update request status:', error);
    throw error;
  }
}

export async function getRequestById(requestId: string): Promise<ServiceRequest> {
  try {
    const { data } = await api.get(`/service-requests/${requestId}`);
    return data as ServiceRequest;
  } catch (error) {
    console.error('Failed to fetch request:', error);
    throw error;
  }
}

