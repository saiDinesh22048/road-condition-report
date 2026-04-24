// Authentication Controller

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { 
  sendSuccess, 
  badRequest, 
  unauthorized, 
  conflict,
  notFound,
  serverError,
  formatValidationErrors 
} from '../utils/errorHandler';
import { 
  AuthenticatedRequest, 
  RegisterUserDto, 
  LoginUserDto,
  AuthResponse 
} from '../types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds
const SALT_ROUNDS = 12;

// ============================================
// REGISTER USER
// ============================================
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, 'Validation failed', formatValidationErrors(errors.array() as any));
      return;
    }

    const { email, password, name, phone }: RegisterUserDto = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      conflict(res, 'An account with this email already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone: phone || null,
        role: 'USER'
      }
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY_SECONDS }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };

    sendSuccess(res, 201, 'Registration successful', response);
  } catch (error) {
    console.error('Registration error:', error);
    serverError(res, 'Registration failed. Please try again.');
  }
};

// ============================================
// LOGIN USER
// ============================================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, 'Validation failed', formatValidationErrors(errors.array() as any));
      return;
    }

    const { email, password }: LoginUserDto = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      unauthorized(res, 'Invalid email or password');
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      unauthorized(res, 'Invalid email or password');
      return;
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY_SECONDS }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };

    sendSuccess(res, 200, 'Login successful', response);
  } catch (error) {
    console.error('Login error:', error);
    serverError(res, 'Login failed. Please try again.');
  }
};

// ============================================
// ADMIN LOGIN
// ============================================
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, 'Validation failed', formatValidationErrors(errors.array() as any));
      return;
    }

    const { email, password }: LoginUserDto = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      unauthorized(res, 'Invalid email or password');
      return;
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      unauthorized(res, 'Invalid email or password');
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      unauthorized(res, 'Invalid email or password');
      return;
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY_SECONDS }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };

    sendSuccess(res, 200, 'Admin login successful', response);
  } catch (error) {
    console.error('Admin login error:', error);
    serverError(res, 'Login failed. Please try again.');
  }
};

// ============================================
// GET CURRENT USER
// ============================================
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      unauthorized(res);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      notFound(res, 'User not found');
      return;
    }

    sendSuccess(res, 200, 'User retrieved successfully', user);
  } catch (error) {
    console.error('Get current user error:', error);
    serverError(res);
  }
};

// ============================================
// REQUEST PASSWORD RESET
// ============================================
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, 'Validation failed', formatValidationErrors(errors.array() as any));
      return;
    }

    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration
    // In production, this would send an email
    if (user) {
      // Generate reset token
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate any existing tokens
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true }
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt
        }
      });

      // In production, send email here
      // For development, log the token
      console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
    }

    sendSuccess(res, 200, 'If an account exists with this email, a password reset link has been sent.');
  } catch (error) {
    console.error('Password reset request error:', error);
    serverError(res);
  }
};

// ============================================
// RESET PASSWORD
// ============================================
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, 'Validation failed', formatValidationErrors(errors.array() as any));
      return;
    }

    const { token, newPassword } = req.body;

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!resetToken) {
      badRequest(res, 'Invalid or expired reset token');
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ]);

    sendSuccess(res, 200, 'Password has been reset successfully');
  } catch (error) {
    console.error('Password reset error:', error);
    serverError(res);
  }
};

// ============================================
// CHANGE PASSWORD (for logged in users)
// ============================================
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      unauthorized(res);
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      badRequest(res, 'Current password and new password are required');
      return;
    }

    if (newPassword.length < 8) {
      badRequest(res, 'New password must be at least 8 characters long');
      return;
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      notFound(res, 'User not found');
      return;
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      badRequest(res, 'Current password is incorrect');
      return;
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    serverError(res);
  }
};
