"use strict";
// Authentication Controller
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.requestPasswordReset = exports.getCurrentUser = exports.adminLogin = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds
const SALT_ROUNDS = 12;
// ============================================
// REGISTER USER
// ============================================
const register = async (req, res) => {
    try {
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            (0, errorHandler_1.badRequest)(res, 'Validation failed', (0, errorHandler_1.formatValidationErrors)(errors.array()));
            return;
        }
        const { email, password, name, phone } = req.body;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (existingUser) {
            (0, errorHandler_1.conflict)(res, 'An account with this email already exists');
            return;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY_SECONDS });
        const response = {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
        (0, errorHandler_1.sendSuccess)(res, 201, 'Registration successful', response);
    }
    catch (error) {
        console.error('Registration error:', error);
        (0, errorHandler_1.serverError)(res, 'Registration failed. Please try again.');
    }
};
exports.register = register;
// ============================================
// LOGIN USER
// ============================================
const login = async (req, res) => {
    try {
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            (0, errorHandler_1.badRequest)(res, 'Validation failed', (0, errorHandler_1.formatValidationErrors)(errors.array()));
            return;
        }
        const { email, password } = req.body;
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (!user) {
            (0, errorHandler_1.unauthorized)(res, 'Invalid email or password');
            return;
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            (0, errorHandler_1.unauthorized)(res, 'Invalid email or password');
            return;
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY_SECONDS });
        const response = {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
        (0, errorHandler_1.sendSuccess)(res, 200, 'Login successful', response);
    }
    catch (error) {
        console.error('Login error:', error);
        (0, errorHandler_1.serverError)(res, 'Login failed. Please try again.');
    }
};
exports.login = login;
// ============================================
// ADMIN LOGIN
// ============================================
const adminLogin = async (req, res) => {
    try {
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            (0, errorHandler_1.badRequest)(res, 'Validation failed', (0, errorHandler_1.formatValidationErrors)(errors.array()));
            return;
        }
        const { email, password } = req.body;
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (!user) {
            (0, errorHandler_1.unauthorized)(res, 'Invalid email or password');
            return;
        }
        // Check if user is admin
        if (user.role !== 'ADMIN') {
            (0, errorHandler_1.unauthorized)(res, 'Invalid email or password');
            return;
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            (0, errorHandler_1.unauthorized)(res, 'Invalid email or password');
            return;
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY_SECONDS });
        const response = {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
        (0, errorHandler_1.sendSuccess)(res, 200, 'Admin login successful', response);
    }
    catch (error) {
        console.error('Admin login error:', error);
        (0, errorHandler_1.serverError)(res, 'Login failed. Please try again.');
    }
};
exports.adminLogin = adminLogin;
// ============================================
// GET CURRENT USER
// ============================================
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            (0, errorHandler_1.unauthorized)(res);
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
            (0, errorHandler_1.notFound)(res, 'User not found');
            return;
        }
        (0, errorHandler_1.sendSuccess)(res, 200, 'User retrieved successfully', user);
    }
    catch (error) {
        console.error('Get current user error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.getCurrentUser = getCurrentUser;
// ============================================
// REQUEST PASSWORD RESET
// ============================================
const requestPasswordReset = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            (0, errorHandler_1.badRequest)(res, 'Validation failed', (0, errorHandler_1.formatValidationErrors)(errors.array()));
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
            const resetToken = (0, uuid_1.v4)();
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
        (0, errorHandler_1.sendSuccess)(res, 200, 'If an account exists with this email, a password reset link has been sent.');
    }
    catch (error) {
        console.error('Password reset request error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.requestPasswordReset = requestPasswordReset;
// ============================================
// RESET PASSWORD
// ============================================
const resetPassword = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            (0, errorHandler_1.badRequest)(res, 'Validation failed', (0, errorHandler_1.formatValidationErrors)(errors.array()));
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
            (0, errorHandler_1.badRequest)(res, 'Invalid or expired reset token');
            return;
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
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
        (0, errorHandler_1.sendSuccess)(res, 200, 'Password has been reset successfully');
    }
    catch (error) {
        console.error('Password reset error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.resetPassword = resetPassword;
// ============================================
// CHANGE PASSWORD (for logged in users)
// ============================================
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            (0, errorHandler_1.unauthorized)(res);
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            (0, errorHandler_1.badRequest)(res, 'Current password and new password are required');
            return;
        }
        if (newPassword.length < 8) {
            (0, errorHandler_1.badRequest)(res, 'New password must be at least 8 characters long');
            return;
        }
        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            (0, errorHandler_1.notFound)(res, 'User not found');
            return;
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            (0, errorHandler_1.badRequest)(res, 'Current password is incorrect');
            return;
        }
        // Hash and update new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        (0, errorHandler_1.sendSuccess)(res, 200, 'Password changed successfully');
    }
    catch (error) {
        console.error('Change password error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map