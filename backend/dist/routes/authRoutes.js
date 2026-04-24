"use strict";
// Authentication Routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', validation_1.validateRegister, authController_1.register);
router.post('/login', validation_1.validateLogin, authController_1.login);
router.post('/admin/login', validation_1.validateLogin, authController_1.adminLogin);
router.post('/password-reset/request', validation_1.validatePasswordResetRequest, authController_1.requestPasswordReset);
router.post('/password-reset', validation_1.validatePasswordReset, authController_1.resetPassword);
// Protected routes
router.get('/me', auth_1.requireAuth, authController_1.getCurrentUser);
router.post('/change-password', auth_1.requireAuth, authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map