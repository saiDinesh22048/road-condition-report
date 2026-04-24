// Application Constants and Configuration
// This file contains all shared constants used across the application

// ============================================
// FIXED ISSUE CATEGORIES
// ============================================
export const ISSUE_CATEGORIES = [
  'pothole',
  'crack',
  'waterlogging',
  'debris on road',
  'damaged signboard',
  'damaged divider',
  'blocked drainage'
] as const;

export type IssueCategory = typeof ISSUE_CATEGORIES[number];

// ============================================
// FIXED COMPLAINT STATUSES
// ============================================
export const COMPLAINT_STATUSES = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected'
] as const;

export type ComplaintStatus = typeof COMPLAINT_STATUSES[number];

// ============================================
// STATUS TRANSITION RULES
// ============================================
// Defines which statuses can transition to which other statuses
export const STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  'Submitted': ['Under Review', 'Rejected'],
  'Under Review': ['Assigned', 'Rejected'],
  'Assigned': ['In Progress', 'Under Review', 'Rejected'],
  'In Progress': ['Resolved', 'Assigned', 'Rejected'],
  'Resolved': [], // Terminal state - no further transitions
  'Rejected': []  // Terminal state - no further transitions
};

// ============================================
// USER ROLES
// ============================================
export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = typeof USER_ROLES[number];

// ============================================
// PENDING STATUSES
// ============================================
// Definition: "Pending" complaints are those that are not yet resolved or rejected
// These are complaints that still require action
export const PENDING_STATUSES: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress'
];

// ============================================
// VALIDATION RULES
// ============================================
export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    maxLength: 100
  },
  name: {
    minLength: 2,
    maxLength: 100
  },
  description: {
    minLength: 10,
    maxLength: 2000
  },
  address: {
    minLength: 10,
    maxLength: 500
  },
  title: {
    maxLength: 200
  },
  adminRemarks: {
    maxLength: 1000
  },
  phone: {
    pattern: /^[+]?[\d\s-]{10,15}$/
  }
};

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
export const FILE_UPLOAD_CONFIG = {
  maxSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
  uploadDir: process.env.UPLOAD_DIR || 'uploads'
};

// ============================================
// COMPLAINT ID FORMAT
// ============================================
// Format: RC-YYYYMMDD-XXXX (e.g., RC-20260423-0001)
export const generateComplaintId = (sequenceNumber: number): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(sequenceNumber).padStart(4, '0');
  return `RC-${year}${month}${day}-${sequence}`;
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export const isValidCategory = (category: string): category is IssueCategory => {
  return ISSUE_CATEGORIES.includes(category as IssueCategory);
};

export const isValidStatus = (status: string): status is ComplaintStatus => {
  return COMPLAINT_STATUSES.includes(status as ComplaintStatus);
};

export const isValidTransition = (currentStatus: ComplaintStatus, newStatus: ComplaintStatus): boolean => {
  return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
};

export const isPendingStatus = (status: ComplaintStatus): boolean => {
  return PENDING_STATUSES.includes(status);
};
