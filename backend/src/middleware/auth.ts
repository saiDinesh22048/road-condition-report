// Authentication Middleware

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserPayload } from '../types';
import { unauthorized, forbidden } from '../utils/errorHandler';
import { UserRole } from '../config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// ============================================
// VERIFY JWT TOKEN
// ============================================
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      unauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      unauthorized(res, 'Invalid token format');
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      unauthorized(res, 'Token has expired');
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      unauthorized(res, 'Invalid token');
      return;
    }
    unauthorized(res, 'Authentication failed');
  }
};

// ============================================
// ROLE-BASED AUTHORIZATION
// ============================================
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, 'Not authenticated');
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      forbidden(res, 'You do not have permission to access this resource');
      return;
    }

    next();
  };
};

// ============================================
// COMBINED AUTH MIDDLEWARE
// ============================================
export const requireAuth = authenticate;

export const requireAdmin = [
  authenticate,
  authorize('ADMIN')
];

export const requireUser = [
  authenticate,
  authorize('USER')
];
