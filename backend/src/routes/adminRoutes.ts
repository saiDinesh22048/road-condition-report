// Admin Routes

import { Router } from 'express';
import {
  getAllComplaints,
  getComplaintDetail,
  updateComplaintStatus,
  addAdminRemarks,
  getAnalytics,
  acceptComplaint,
  rejectComplaint
} from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';
import {
  validateComplaintFilters,
  validateComplaintId,
  validateUpdateStatus
} from '../middleware/validation';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin as any);

// Analytics
router.get('/analytics', getAnalytics);

// Get all complaints (with filters)
router.get('/complaints', validateComplaintFilters, getAllComplaints);

// Get single complaint detail
router.get('/complaints/:id', validateComplaintId, getComplaintDetail);

// Update complaint status
router.patch(
  '/complaints/:id/status',
  validateComplaintId,
  validateUpdateStatus,
  updateComplaintStatus
);

// Add admin remarks
router.patch('/complaints/:id/remarks', validateComplaintId, addAdminRemarks);

// Accept complaint (move to Under Review)
router.post('/complaints/:id/accept', validateComplaintId, acceptComplaint);

// Reject complaint
router.post('/complaints/:id/reject', validateComplaintId, rejectComplaint);

export default router;
