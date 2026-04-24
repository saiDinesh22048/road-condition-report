"use strict";
// Admin Routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All admin routes require admin authentication
router.use(auth_1.requireAdmin);
// Analytics
router.get('/analytics', adminController_1.getAnalytics);
// Get all complaints (with filters)
router.get('/complaints', validation_1.validateComplaintFilters, adminController_1.getAllComplaints);
// Get single complaint detail
router.get('/complaints/:id', validation_1.validateComplaintId, adminController_1.getComplaintDetail);
// Update complaint status
router.patch('/complaints/:id/status', validation_1.validateComplaintId, validation_1.validateUpdateStatus, adminController_1.updateComplaintStatus);
// Add admin remarks
router.patch('/complaints/:id/remarks', validation_1.validateComplaintId, adminController_1.addAdminRemarks);
// Accept complaint (move to Under Review)
router.post('/complaints/:id/accept', validation_1.validateComplaintId, adminController_1.acceptComplaint);
// Reject complaint
router.post('/complaints/:id/reject', validation_1.validateComplaintId, adminController_1.rejectComplaint);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map