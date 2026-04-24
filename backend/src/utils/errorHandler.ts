// Utility functions for error handling and responses

import { Response } from 'express';
import { ApiResponse, ValidationError } from '../types';

// ============================================
// CUSTOM ERROR CLASS
// ============================================
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================
// ERROR RESPONSE HELPERS
// ============================================
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: ValidationError[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors
  };
  return res.status(statusCode).json(response);
};

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(response);
};

// ============================================
// COMMON ERROR RESPONSES
// ============================================
export const badRequest = (res: Response, message: string, errors?: ValidationError[]) =>
  sendError(res, 400, message, errors);

export const unauthorized = (res: Response, message = 'Unauthorized') =>
  sendError(res, 401, message);

export const forbidden = (res: Response, message = 'Forbidden') =>
  sendError(res, 403, message);

export const notFound = (res: Response, message = 'Resource not found') =>
  sendError(res, 404, message);

export const conflict = (res: Response, message: string) =>
  sendError(res, 409, message);

export const serverError = (res: Response, message = 'Internal server error') =>
  sendError(res, 500, message);

// ============================================
// VALIDATION HELPER
// ============================================
export const formatValidationErrors = (errors: Array<{ path: string; msg: string }>): ValidationError[] => {
  return errors.map(err => ({
    field: err.path,
    message: err.msg
  }));
};
