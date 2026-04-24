"use strict";
// Application Constants and Configuration
// This file contains all shared constants used across the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPendingStatus = exports.isValidTransition = exports.isValidStatus = exports.isValidCategory = exports.generateComplaintId = exports.FILE_UPLOAD_CONFIG = exports.VALIDATION_RULES = exports.PENDING_STATUSES = exports.USER_ROLES = exports.STATUS_TRANSITIONS = exports.COMPLAINT_STATUSES = exports.ISSUE_CATEGORIES = void 0;
// ============================================
// FIXED ISSUE CATEGORIES
// ============================================
exports.ISSUE_CATEGORIES = [
    'pothole',
    'crack',
    'waterlogging',
    'debris on road',
    'damaged signboard',
    'damaged divider',
    'blocked drainage'
];
// ============================================
// FIXED COMPLAINT STATUSES
// ============================================
exports.COMPLAINT_STATUSES = [
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
    'Rejected'
];
// ============================================
// STATUS TRANSITION RULES
// ============================================
// Defines which statuses can transition to which other statuses
exports.STATUS_TRANSITIONS = {
    'Submitted': ['Under Review', 'Rejected'],
    'Under Review': ['Assigned', 'Rejected'],
    'Assigned': ['In Progress', 'Under Review', 'Rejected'],
    'In Progress': ['Resolved', 'Assigned', 'Rejected'],
    'Resolved': [], // Terminal state - no further transitions
    'Rejected': [] // Terminal state - no further transitions
};
// ============================================
// USER ROLES
// ============================================
exports.USER_ROLES = ['USER', 'ADMIN'];
// ============================================
// PENDING STATUSES
// ============================================
// Definition: "Pending" complaints are those that are not yet resolved or rejected
// These are complaints that still require action
exports.PENDING_STATUSES = [
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress'
];
// ============================================
// VALIDATION RULES
// ============================================
exports.VALIDATION_RULES = {
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
exports.FILE_UPLOAD_CONFIG = {
    maxSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
};
// ============================================
// COMPLAINT ID FORMAT
// ============================================
// Format: RC-YYYYMMDD-XXXX (e.g., RC-20260423-0001)
const generateComplaintId = (sequenceNumber) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(sequenceNumber).padStart(4, '0');
    return `RC-${year}${month}${day}-${sequence}`;
};
exports.generateComplaintId = generateComplaintId;
// ============================================
// HELPER FUNCTIONS
// ============================================
const isValidCategory = (category) => {
    return exports.ISSUE_CATEGORIES.includes(category);
};
exports.isValidCategory = isValidCategory;
const isValidStatus = (status) => {
    return exports.COMPLAINT_STATUSES.includes(status);
};
exports.isValidStatus = isValidStatus;
const isValidTransition = (currentStatus, newStatus) => {
    return exports.STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
};
exports.isValidTransition = isValidTransition;
const isPendingStatus = (status) => {
    return exports.PENDING_STATUSES.includes(status);
};
exports.isPendingStatus = isPendingStatus;
//# sourceMappingURL=constants.js.map