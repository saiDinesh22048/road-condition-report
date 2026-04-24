// Request Validation Middleware

import { body, query, param } from 'express-validator';
import { 
  ISSUE_CATEGORIES, 
  COMPLAINT_STATUSES, 
  VALIDATION_RULES,
  isValidCategory,
  isValidStatus
} from '../config/constants';

// ============================================
// AUTH VALIDATION
// ============================================
export const validateRegister = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: VALIDATION_RULES.password.minLength })
    .withMessage(`Password must be at least ${VALIDATION_RULES.password.minLength} characters long`)
    .isLength({ max: VALIDATION_RULES.password.maxLength })
    .withMessage(`Password must be at most ${VALIDATION_RULES.password.maxLength} characters long`),
  body('name')
    .trim()
    .isLength({ min: VALIDATION_RULES.name.minLength })
    .withMessage(`Name must be at least ${VALIDATION_RULES.name.minLength} characters long`)
    .isLength({ max: VALIDATION_RULES.name.maxLength })
    .withMessage(`Name must be at most ${VALIDATION_RULES.name.maxLength} characters long`),
  body('phone')
    .optional()
    .trim()
    .matches(VALIDATION_RULES.phone.pattern)
    .withMessage('Please provide a valid phone number')
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validatePasswordResetRequest = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

export const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: VALIDATION_RULES.password.minLength })
    .withMessage(`Password must be at least ${VALIDATION_RULES.password.minLength} characters long`)
    .isLength({ max: VALIDATION_RULES.password.maxLength })
    .withMessage(`Password must be at most ${VALIDATION_RULES.password.maxLength} characters long`)
];

// ============================================
// COMPLAINT VALIDATION
// ============================================
export const validateCreateComplaint = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .custom((value) => {
      if (!isValidCategory(value)) {
        throw new Error(`Invalid category. Allowed categories: ${ISSUE_CATEGORIES.join(', ')}`);
      }
      return true;
    }),
  body('title')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_RULES.title.maxLength })
    .withMessage(`Title must be at most ${VALIDATION_RULES.title.maxLength} characters long`),
  body('description')
    .trim()
    .isLength({ min: VALIDATION_RULES.description.minLength })
    .withMessage(`Description must be at least ${VALIDATION_RULES.description.minLength} characters long`)
    .isLength({ max: VALIDATION_RULES.description.maxLength })
    .withMessage(`Description must be at most ${VALIDATION_RULES.description.maxLength} characters long`),
  body('address')
    .trim()
    .isLength({ min: VALIDATION_RULES.address.minLength })
    .withMessage(`Address must be at least ${VALIDATION_RULES.address.minLength} characters long`)
    .isLength({ max: VALIDATION_RULES.address.maxLength })
    .withMessage(`Address must be at most ${VALIDATION_RULES.address.maxLength} characters long`)
];

export const validateUpdateStatus = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .custom((value) => {
      if (!isValidStatus(value)) {
        throw new Error(`Invalid status. Allowed statuses: ${COMPLAINT_STATUSES.join(', ')}`);
      }
      return true;
    }),
  body('adminRemarks')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_RULES.adminRemarks.maxLength })
    .withMessage(`Remarks must be at most ${VALIDATION_RULES.adminRemarks.maxLength} characters long`)
];

// ============================================
// QUERY VALIDATION
// ============================================
export const validateComplaintFilters = [
  query('status')
    .optional()
    .custom((value) => {
      if (value && !isValidStatus(value)) {
        throw new Error(`Invalid status filter. Allowed: ${COMPLAINT_STATUSES.join(', ')}`);
      }
      return true;
    }),
  query('category')
    .optional()
    .custom((value) => {
      if (value && !isValidCategory(value)) {
        throw new Error(`Invalid category filter. Allowed: ${ISSUE_CATEGORIES.join(', ')}`);
      }
      return true;
    }),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// ============================================
// PARAM VALIDATION
// ============================================
export const validateComplaintId = [
  param('id')
    .notEmpty()
    .withMessage('Complaint ID is required')
];
