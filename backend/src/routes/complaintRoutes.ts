// Complaint Routes (User)

import { Router, Request, Response, NextFunction } from 'express';
import {
  createComplaint,
  getMyComplaints,
  getMyComplaint,
  getComplaintStatus
} from '../controllers/complaintController';
import { requireAuth } from '../middleware/auth';
import { upload, handleUploadError } from '../middleware/upload';
import {
  validateCreateComplaint,
  validateComplaintFilters,
  validateComplaintId
} from '../middleware/validation';
import { badRequest } from '../utils/errorHandler';

const router = Router();

// File upload error handling middleware
const handleFileUploadErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err) {
    const message = handleUploadError(err);
    badRequest(res, message);
    return;
  }
  next();
};

// Create complaint with image upload
router.post(
  '/',
  requireAuth,
  upload.array('images', 5),
  handleFileUploadErrors,
  validateCreateComplaint,
  createComplaint
);

// Get my complaints
router.get(
  '/',
  requireAuth,
  validateComplaintFilters,
  getMyComplaints
);

// Get single complaint
router.get(
  '/:id',
  requireAuth,
  validateComplaintId,
  getMyComplaint
);

// Get complaint status
router.get(
  '/:id/status',
  requireAuth,
  validateComplaintId,
  getComplaintStatus
);

export default router;
