import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '../lib/env';

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

// API Error interface
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post('/api/auth/refresh', {
              refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// API client instance
const apiClient = createApiClient();

// Generic API methods
export const api = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.get(url, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.put(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.patch(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.delete(url, config);
    return response.data;
  },

  // Upload file
  upload: async <T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Upload multiple files
  uploadMultiple: async <T = any>(url: string, files: File[], onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },
};

// Authentication API
export const authApi = {
  // Register user
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: 'buyer' | 'seller';
    phone?: string;
  }) => {
    return api.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    return api.post('/auth/login', credentials);
  },

  // Logout user
  logout: async (refreshToken: string) => {
    return api.post('/auth/logout', { refreshToken });
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    return api.post('/auth/refresh', { refreshToken });
  },

  // Get current user
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  // Verify email
  verifyEmail: async (token: string) => {
    return api.post('/auth/verify-email', { token });
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    return api.put('/auth/password', { currentPassword, newPassword });
  },
};

// User API
export const userApi = {
  // Get user profile
  getProfile: async () => {
    return api.get('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
    avatar?: string;
  }) => {
    return api.put('/users/profile', profileData);
  },

  // Upload avatar
  uploadAvatar: async (file: File, onProgress?: (progress: number) => void) => {
    return api.upload('/users/avatar', file, onProgress);
  },

  // Get user stats
  getStats: async () => {
    return api.get('/users/stats');
  },

  // Get user activity
  getActivity: async (page: number = 1, limit: number = 10) => {
    return api.get(`/users/activity?page=${page}&limit=${limit}`);
  },

  // Delete account
  deleteAccount: async (password: string) => {
    return api.delete('/users/account', { data: { password } });
  },
};

// Service Request API
export const serviceRequestApi = {
  // Create instant request
  createInstantRequest: async (requestData: {
    category: string;
    description: string;
    price: number;
    location: {
      address: string;
      coordinates: [number, number];
    };
    broadcastRadius?: number;
  }) => {
    return api.post('/service-requests/instant', requestData);
  },

  // Create scheduled request
  createScheduledRequest: async (requestData: {
    category: string;
    description: string;
    price: number;
    location: {
      address: string;
      coordinates: [number, number];
    };
    scheduledDate: string;
    scheduledTime: string;
  }) => {
    return api.post('/service-requests/scheduled', requestData);
  },

  // Get user requests
  getUserRequests: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    return api.get(`/service-requests/user?${params}`);
  },

  // Get seller requests
  getSellerRequests: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    return api.get(`/service-requests/seller?${params}`);
  },

  // Get request by ID
  getRequestById: async (id: string) => {
    return api.get(`/service-requests/${id}`);
  },

  // Boost price
  boostPrice: async (id: string, newPrice: number) => {
    return api.put(`/service-requests/${id}/boost`, { newPrice });
  },

  // Accept request
  acceptRequest: async (id: string) => {
    return api.put(`/service-requests/${id}/accept`);
  },

  // Update status
  updateStatus: async (id: string, status: string, reason?: string) => {
    return api.put(`/service-requests/${id}/status`, { status, reason });
  },

  // Delete request
  deleteRequest: async (id: string) => {
    return api.delete(`/service-requests/${id}`);
  },

  // Get nearby requests
  getNearbyRequests: async (lat: number, lng: number, radius: number = 50, category?: string) => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      ...(category && { category })
    });
    return api.get(`/service-requests/nearby?${params}`);
  },

  // Get request stats
  getStats: async () => {
    return api.get('/service-requests/stats');
  },
};

// Seller API
export const sellerApi = {
  // Get all sellers
  getSellers: async (page: number = 1, limit: number = 10, filters?: {
    category?: string;
    rating?: number;
    availability?: boolean;
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.rating && { rating: filters.rating.toString() }),
      ...(filters?.availability !== undefined && { availability: filters.availability.toString() })
    });
    return api.get(`/sellers?${params}`);
  },

  // Get seller by ID
  getSellerById: async (id: string) => {
    return api.get(`/sellers/${id}`);
  },

  // Get seller profile
  getSellerProfile: async () => {
    return api.get('/sellers/profile/me');
  },

  // Create seller profile
  createProfile: async (profileData: {
    bio: string;
    location: {
      address: string;
      coordinates: [number, number];
    };
    serviceCategories: string[];
    yearsOfExperience: number;
    certifications?: string[];
    profilePicture?: string;
    portfolio?: string[];
  }) => {
    return api.post('/sellers/profile', profileData);
  },

  // Update seller profile
  updateProfile: async (profileData: {
    bio?: string;
    location?: {
      address: string;
      coordinates: [number, number];
    };
    serviceCategories?: string[];
    yearsOfExperience?: number;
    certifications?: string[];
    availability?: boolean;
    profilePicture?: string;
    portfolio?: string[];
  }) => {
    return api.put('/sellers/profile', profileData);
  },

  // Get sellers by category
  getSellersByCategory: async (category: string, page: number = 1, limit: number = 10) => {
    return api.get(`/sellers/category/${category}?page=${page}&limit=${limit}`);
  },

  // Get nearby sellers
  getNearbySellers: async (lat: number, lng: number, radius: number = 50, category?: string) => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      ...(category && { category })
    });
    return api.get(`/sellers/nearby?${params}`);
  },

  // Upload portfolio
  uploadPortfolio: async (files: File[], onProgress?: (progress: number) => void) => {
    return api.uploadMultiple('/sellers/portfolio', files, onProgress);
  },

  // Get top-rated sellers
  getTopRatedSellers: async (limit: number = 10, category?: string) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(category && { category })
    });
    return api.get(`/sellers/top-rated?${params}`);
  },

  // Update availability
  updateAvailability: async (availability: boolean) => {
    return api.put('/sellers/availability', { availability });
  },

  // Get seller stats
  getStats: async () => {
    return api.get('/sellers/stats');
  },
};

// Admin API
export const adminApi = {
  // Get all users
  getUsers: async (page: number = 1, limit: number = 10, filters?: {
    role?: string;
    status?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search })
    });
    return api.get(`/admin/users?${params}`);
  },

  // Block user
  blockUser: async (id: string, reason?: string) => {
    return api.put(`/admin/users/${id}/block`, { reason });
  },

  // Unblock user
  unblockUser: async (id: string) => {
    return api.put(`/admin/users/${id}/unblock`);
  },

  // Update user role
  updateUserRole: async (id: string, role: string) => {
    return api.put(`/admin/users/${id}/role`, { role });
  },

  // Get pending sellers
  getPendingSellers: async (page: number = 1, limit: number = 10) => {
    return api.get(`/admin/sellers/pending?page=${page}&limit=${limit}`);
  },

  // Approve seller
  approveSeller: async (id: string) => {
    return api.put(`/admin/sellers/${id}/approve`);
  },

  // Reject seller
  rejectSeller: async (id: string, reason: string) => {
    return api.put(`/admin/sellers/${id}/reject`, { reason });
  },

  // Get analytics
  getAnalytics: async (period: string = '30d') => {
    return api.get(`/admin/analytics?period=${period}`);
  },

  // Get audit logs
  getAuditLogs: async (page: number = 1, limit: number = 10) => {
    return api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
  },

  // Get system health
  getSystemHealth: async () => {
    return api.get('/admin/system-health');
  },
};

// Error handling utility
export const handleApiError = (error: any): ApiError => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'An error occurred',
      code: error.response.data.code,
      status: error.response.status
    };
  }
  
  return {
    message: error.message || 'Network error',
    status: 0
  };
};

export default api;