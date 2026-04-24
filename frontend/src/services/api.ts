import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  Complaint,
  ComplaintListItem,
  ComplaintSubmissionResponse,
  PaginatedResponse,
  AnalyticsSummary,
  User,
  ComplaintFilters,
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  adminLogin: async (data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/admin/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  requestPasswordReset: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/password-reset/request', { email });
    return response.data;
  },

  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/auth/password-reset', data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
};

// ============================================
// COMPLAINT API (User)
// ============================================
export const complaintApi = {
  create: async (formData: FormData): Promise<ApiResponse<ComplaintSubmissionResponse>> => {
    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyComplaints: async (
    filters?: ComplaintFilters
  ): Promise<ApiResponse<PaginatedResponse<ComplaintListItem>>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/complaints?${params.toString()}`);
    return response.data;
  },

  getMyComplaint: async (id: string): Promise<ApiResponse<Complaint>> => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  getComplaintStatus: async (
    id: string
  ): Promise<ApiResponse<{ complaintId: string; status: string; adminRemarks?: string; updatedAt: string }>> => {
    const response = await api.get(`/complaints/${id}/status`);
    return response.data;
  },
};

// ============================================
// ADMIN API
// ============================================
export const adminApi = {
  getAnalytics: async (): Promise<ApiResponse<AnalyticsSummary>> => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getAllComplaints: async (
    filters?: ComplaintFilters & { sortBy?: string; sortOrder?: string }
  ): Promise<ApiResponse<PaginatedResponse<Complaint>>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/admin/complaints?${params.toString()}`);
    return response.data;
  },

  getComplaintDetail: async (id: string): Promise<ApiResponse<Complaint>> => {
    const response = await api.get(`/admin/complaints/${id}`);
    return response.data;
  },

  updateComplaintStatus: async (
    id: string,
    data: { status: string; adminRemarks?: string }
  ): Promise<ApiResponse<Partial<Complaint>>> => {
    const response = await api.patch(`/admin/complaints/${id}/status`, data);
    return response.data;
  },

  addRemarks: async (
    id: string,
    remarks: string
  ): Promise<ApiResponse<{ complaintId: string; adminRemarks: string }>> => {
    const response = await api.patch(`/admin/complaints/${id}/remarks`, { remarks });
    return response.data;
  },

  acceptComplaint: async (
    id: string,
    remarks?: string
  ): Promise<ApiResponse<Partial<Complaint>>> => {
    const response = await api.post(`/admin/complaints/${id}/accept`, { remarks });
    return response.data;
  },

  rejectComplaint: async (
    id: string,
    remarks: string
  ): Promise<ApiResponse<Partial<Complaint>>> => {
    const response = await api.post(`/admin/complaints/${id}/reject`, { remarks });
    return response.data;
  },
};

export default api;
