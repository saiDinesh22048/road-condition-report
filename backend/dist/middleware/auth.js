"use strict";
// Authentication Middleware
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = exports.requireAdmin = exports.requireAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../utils/errorHandler");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
// ============================================
// VERIFY JWT TOKEN
// ============================================
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, errorHandler_1.unauthorized)(res, 'No token provided');
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            (0, errorHandler_1.unauthorized)(res, 'Invalid token format');
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            (0, errorHandler_1.unauthorized)(res, 'Token has expired');
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            (0, errorHandler_1.unauthorized)(res, 'Invalid token');
            return;
        }
        (0, errorHandler_1.unauthorized)(res, 'Authentication failed');
    }
};
exports.authenticate = authenticate;
// ============================================
// ROLE-BASED AUTHORIZATION
// ============================================
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, errorHandler_1.unauthorized)(res, 'Not authenticated');
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            (0, errorHandler_1.forbidden)(res, 'You do not have permission to access this resource');
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// ============================================
// COMBINED AUTH MIDDLEWARE
// ============================================
exports.requireAuth = exports.authenticate;
exports.requireAdmin = [
    exports.authenticate,
    (0, exports.authorize)('ADMIN')
];
exports.requireUser = [
    exports.authenticate,
    (0, exports.authorize)('USER')
];
//# sourceMappingURL=auth.js.map