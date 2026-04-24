// Authentication Routes

import { Router } from 'express';
import {
  register,
  login,
  adminLogin,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  changePassword
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import {
  validateRegister,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset
} from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/admin/login', validateLogin, adminLogin);
router.post('/password-reset/request', validatePasswordResetRequest, requestPasswordReset);
router.post('/password-reset', validatePasswordReset, resetPassword);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);
router.post('/change-password', requireAuth, changePassword);

export default router;
