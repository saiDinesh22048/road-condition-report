// Type definitions for Road Condition Reporting App Frontend

// ============================================
// USER TYPES
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================
// COMPLAINT TYPES
// ============================================
export type IssueCategory =
  | 'pothole'
  | 'crack'
  | 'waterlogging'
  | 'debris on road'
  | 'damaged signboard'
  | 'damaged divider'
  | 'blocked drainage';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export interface ComplaintImage {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  path: string;
}

export interface Complaint {
  id: string;
  complaintId: string;
  category: IssueCategory;
  title?: string;
  description: string;
  address: string;
  status: ComplaintStatus;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
  images?: ComplaintImage[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface ComplaintListItem {
  id: string;
  complaintId: string;
  category: IssueCategory;
  title?: string;
  address: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintSubmissionResponse {
  complaintId: string;
  message: string;
  submittedAt: string;
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
export interface CategoryCount {
  category: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface AnalyticsSummary {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  complaintsByCategory: CategoryCount[];
  complaintsByStatus: StatusCount[];
}

// ============================================
// FORM TYPES
// ============================================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
}

export interface ComplaintFormData {
  category: IssueCategory | '';
  title?: string;
  description: string;
  address: string;
  images: File[];
}

export interface ResetPasswordFormData {
  email: string;
}

export interface NewPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================
// FILTER TYPES
// ============================================
export interface ComplaintFilters {
  status?: ComplaintStatus;
  category?: IssueCategory;
  page?: number;
  limit?: number;
}

// ============================================
// CONSTANTS
// ============================================
export const ISSUE_CATEGORIES: IssueCategory[] = [
  'pothole',
  'crack',
  'waterlogging',
  'debris on road',
  'damaged signboard',
  'damaged divider',
  'blocked drainage',
];

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  'pothole': 'Pothole',
  'crack': 'Crack',
  'waterlogging': 'Waterlogging',
  'debris on road': 'Debris on Road',
  'damaged signboard': 'Damaged Signboard',
  'damaged divider': 'Damaged Divider',
  'blocked drainage': 'Blocked Drainage',
};
