// Type definitions for the Road Condition Reporting App

import { Request } from 'express';
import { IssueCategory, ComplaintStatus, UserRole } from '../config/constants';

// ============================================
// USER TYPES
// ============================================
export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface RequestPasswordResetDto {
  email: string;
}

// ============================================
// COMPLAINT TYPES
// ============================================
export interface CreateComplaintDto {
  category: IssueCategory;
  title?: string;
  description: string;
  address: string;
}

export interface UpdateComplaintStatusDto {
  status: ComplaintStatus;
  adminRemarks?: string;
}

export interface ComplaintFilterDto {
  status?: ComplaintStatus;
  category?: IssueCategory;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// ANALYTICS TYPES
// ============================================
export interface AnalyticsSummary {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  complaintsByCategory: CategoryCount[];
  complaintsByStatus: StatusCount[];
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

// ============================================
// COMPLAINT DETAIL TYPES
// ============================================
export interface ComplaintDetail {
  id: string;
  complaintId: string;
  category: string;
  title: string | null;
  description: string;
  address: string;
  status: string;
  adminRemarks: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  images: ComplaintImageDetail[];
}

export interface ComplaintImageDetail {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  path: string;
}

// ============================================
// AUTH RESPONSE TYPES
// ============================================
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface ComplaintSubmissionResponse {
  complaintId: string;
  message: string;
  submittedAt: Date;
}
