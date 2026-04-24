"use strict";
// Utility functions for error handling and responses
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValidationErrors = exports.serverError = exports.conflict = exports.notFound = exports.forbidden = exports.unauthorized = exports.badRequest = exports.sendSuccess = exports.sendError = exports.AppError = void 0;
// ============================================
// CUSTOM ERROR CLASS
// ============================================
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// ============================================
// ERROR RESPONSE HELPERS
// ============================================
const sendError = (res, statusCode, message, errors) => {
    const response = {
        success: false,
        message,
        errors
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendSuccess = (res, statusCode, message, data) => {
    const response = {
        success: true,
        message,
        data
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
// ============================================
// COMMON ERROR RESPONSES
// ============================================
const badRequest = (res, message, errors) => (0, exports.sendError)(res, 400, message, errors);
exports.badRequest = badRequest;
const unauthorized = (res, message = 'Unauthorized') => (0, exports.sendError)(res, 401, message);
exports.unauthorized = unauthorized;
const forbidden = (res, message = 'Forbidden') => (0, exports.sendError)(res, 403, message);
exports.forbidden = forbidden;
const notFound = (res, message = 'Resource not found') => (0, exports.sendError)(res, 404, message);
exports.notFound = notFound;
const conflict = (res, message) => (0, exports.sendError)(res, 409, message);
exports.conflict = conflict;
const serverError = (res, message = 'Internal server error') => (0, exports.sendError)(res, 500, message);
exports.serverError = serverError;
// ============================================
// VALIDATION HELPER
// ============================================
const formatValidationErrors = (errors) => {
    return errors.map(err => ({
        field: err.path,
        message: err.msg
    }));
};
exports.formatValidationErrors = formatValidationErrors;
//# sourceMappingURL=errorHandler.js.map