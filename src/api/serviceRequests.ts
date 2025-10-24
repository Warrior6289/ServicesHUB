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
    // Handle instant request creation error
    throw error;
  }
}

export async function createScheduledRequest(payload: CreateScheduledRequestPayload): Promise<ServiceRequest> {
  try {
    const { data } = await api.post('/service-requests/scheduled', payload);
    return data as ServiceRequest;
  } catch (error) {
    // Handle scheduled request creation error
    throw error;
  }
}

export async function boostRequestPrice(requestId: string, newPrice: number): Promise<ServiceRequest> {
  try {
    const { data } = await api.patch(`/service-requests/${requestId}/boost-price`, { newPrice });
    return data as ServiceRequest;
  } catch (error) {
    // Handle price boost error
    throw error;
  }
}

export async function getUserRequests(): Promise<ServiceRequest[]> {
  try {
    const { data } = await api.get('/service-requests/user');
    return data as ServiceRequest[];
  } catch (error) {
    // Handle user requests fetch error
    throw error;
  }
}

export async function cancelRequest(requestId: string): Promise<void> {
  try {
    await api.patch(`/service-requests/${requestId}/cancel`);
  } catch (error) {
    // Handle request cancellation error
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
    // Handle nearby requests fetch error
    throw error;
  }
}

export async function acceptRequest(requestId: string): Promise<ServiceRequest> {
  try {
    const { data } = await api.post(`/service-requests/${requestId}/accept`);
    return data as ServiceRequest;
  } catch (error) {
    // Handle request acceptance error
    throw error;
  }
}

export async function getSellerRequests(): Promise<ServiceRequest[]> {
  try {
    const { data } = await api.get('/service-requests/seller');
    return data as ServiceRequest[];
  } catch (error) {
    // Handle seller requests fetch error
    throw error;
  }
}

export async function updateRequestStatus(requestId: string, status: ServiceRequestStatus): Promise<ServiceRequest> {
  try {
    const { data } = await api.patch(`/service-requests/${requestId}/status`, { status });
    return data as ServiceRequest;
  } catch (error) {
    // Handle request status update error
    throw error;
  }
}

export async function getRequestById(requestId: string): Promise<ServiceRequest> {
  try {
    const { data } = await api.get(`/service-requests/${requestId}`);
    return data as ServiceRequest;
  } catch (error) {
    // Handle request fetch error
    throw error;
  }
}

