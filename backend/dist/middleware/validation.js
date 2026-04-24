"use strict";
// Request Validation Middleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateComplaintId = exports.validateComplaintFilters = exports.validateUpdateStatus = exports.validateCreateComplaint = exports.validatePasswordReset = exports.validatePasswordResetRequest = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
const constants_1 = require("../config/constants");
// ============================================
// AUTH VALIDATION
// ============================================
exports.validateRegister = [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: constants_1.VALIDATION_RULES.password.minLength })
        .withMessage(`Password must be at least ${constants_1.VALIDATION_RULES.password.minLength} characters long`)
        .isLength({ max: constants_1.VALIDATION_RULES.password.maxLength })
        .withMessage(`Password must be at most ${constants_1.VALIDATION_RULES.password.maxLength} characters long`),
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: constants_1.VALIDATION_RULES.name.minLength })
        .withMessage(`Name must be at least ${constants_1.VALIDATION_RULES.name.minLength} characters long`)
        .isLength({ max: constants_1.VALIDATION_RULES.name.maxLength })
        .withMessage(`Name must be at most ${constants_1.VALIDATION_RULES.name.maxLength} characters long`),
    (0, express_validator_1.body)('phone')
        .optional()
        .trim()
        .matches(constants_1.VALIDATION_RULES.phone.pattern)
        .withMessage('Please provide a valid phone number')
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
exports.validatePasswordResetRequest = [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
];
exports.validatePasswordReset = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: constants_1.VALIDATION_RULES.password.minLength })
        .withMessage(`Password must be at least ${constants_1.VALIDATION_RULES.password.minLength} characters long`)
        .isLength({ max: constants_1.VALIDATION_RULES.password.maxLength })
        .withMessage(`Password must be at most ${constants_1.VALIDATION_RULES.password.maxLength} characters long`)
];
// ============================================
// COMPLAINT VALIDATION
// ============================================
exports.validateCreateComplaint = [
    (0, express_validator_1.body)('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .custom((value) => {
        if (!(0, constants_1.isValidCategory)(value)) {
            throw new Error(`Invalid category. Allowed categories: ${constants_1.ISSUE_CATEGORIES.join(', ')}`);
        }
        return true;
    }),
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ max: constants_1.VALIDATION_RULES.title.maxLength })
        .withMessage(`Title must be at most ${constants_1.VALIDATION_RULES.title.maxLength} characters long`),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: constants_1.VALIDATION_RULES.description.minLength })
        .withMessage(`Description must be at least ${constants_1.VALIDATION_RULES.description.minLength} characters long`)
        .isLength({ max: constants_1.VALIDATION_RULES.description.maxLength })
        .withMessage(`Description must be at most ${constants_1.VALIDATION_RULES.description.maxLength} characters long`),
    (0, express_validator_1.body)('address')
        .trim()
        .isLength({ min: constants_1.VALIDATION_RULES.address.minLength })
        .withMessage(`Address must be at least ${constants_1.VALIDATION_RULES.address.minLength} characters long`)
        .isLength({ max: constants_1.VALIDATION_RULES.address.maxLength })
        .withMessage(`Address must be at most ${constants_1.VALIDATION_RULES.address.maxLength} characters long`)
];
exports.validateUpdateStatus = [
    (0, express_validator_1.body)('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .custom((value) => {
        if (!(0, constants_1.isValidStatus)(value)) {
            throw new Error(`Invalid status. Allowed statuses: ${constants_1.COMPLAINT_STATUSES.join(', ')}`);
        }
        return true;
    }),
    (0, express_validator_1.body)('adminRemarks')
        .optional()
        .trim()
        .isLength({ max: constants_1.VALIDATION_RULES.adminRemarks.maxLength })
        .withMessage(`Remarks must be at most ${constants_1.VALIDATION_RULES.adminRemarks.maxLength} characters long`)
];
// ============================================
// QUERY VALIDATION
// ============================================
exports.validateComplaintFilters = [
    (0, express_validator_1.query)('status')
        .optional()
        .custom((value) => {
        if (value && !(0, constants_1.isValidStatus)(value)) {
            throw new Error(`Invalid status filter. Allowed: ${constants_1.COMPLAINT_STATUSES.join(', ')}`);
        }
        return true;
    }),
    (0, express_validator_1.query)('category')
        .optional()
        .custom((value) => {
        if (value && !(0, constants_1.isValidCategory)(value)) {
            throw new Error(`Invalid category filter. Allowed: ${constants_1.ISSUE_CATEGORIES.join(', ')}`);
        }
        return true;
    }),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
// ============================================
// PARAM VALIDATION
// ============================================
exports.validateComplaintId = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Complaint ID is required')
];
//# sourceMappingURL=validation.js.map