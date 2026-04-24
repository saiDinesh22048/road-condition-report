// Complaint Controller

import { Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import {
  sendSuccess,
  badRequest,
  notFound,
  forbidden,
  serverError,
  formatValidationErrors
} from '../utils/errorHandler';
import {
  AuthenticatedRequest,
  CreateComplaintDto,
  ComplaintSubmissionResponse,
  PaginatedResponse
} from '../types';
import {
  generateComplaintId,
  isValidCategory,
  ISSUE_CATEGORIES
} from '../config/constants';
import { getRelativePath, deleteUploadedFile } from '../middleware/upload';

const prisma = new PrismaClient();

// ============================================
// CREATE COMPLAINT
// ============================================
export const createComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded files on validation error
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          deleteUploadedFile(file.path);
        }
      }
      badRequest(res, 'Validation failed', formatValidationErrors(errors.array() as any));
      return;
    }

    if (!req.user) {
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          deleteUploadedFile(file.path);
        }
      }
      forbidden(res, 'Not authenticated');
      return;
    }

    // Check for uploaded images
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      badRequest(res, 'At least one image is required');
      return;
    }

    const { category, title, description, address }: CreateComplaintDto = req.body;

    // Validate category
    if (!isValidCategory(category)) {
      for (const file of files) {
        deleteUploadedFile(file.path);
      }
      badRequest(res, `Invalid category. Allowed categories: ${ISSUE_CATEGORIES.join(', ')}`);
      return;
    }

    // Get the next sequence number for complaint ID
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayCount = await prisma.complaint.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const complaintId = generateComplaintId(todayCount + 1);

    // Create complaint with images in transaction
    const complaint = await prisma.complaint.create({
      data: {
        complaintId,
        category,
        title: title || null,
        description,
        address,
        status: 'Submitted',
        userId: req.user.id,
        images: {
          create: files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: getRelativePath(file.path)
          }))
        }
      },
      include: {
        images: true
      }
    });

    const response: ComplaintSubmissionResponse = {
      complaintId: complaint.complaintId,
      message: 'Complaint submitted successfully',
      submittedAt: complaint.createdAt
    };

    sendSuccess(res, 201, 'Complaint submitted successfully', response);
  } catch (error) {
    console.error('Create complaint error:', error);
    // Clean up files on error
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        deleteUploadedFile(file.path);
      }
    }
    serverError(res, 'Failed to submit complaint. Please try again.');
  }
};

// ============================================
// GET MY COMPLAINTS (User)
// ============================================
export const getMyComplaints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      forbidden(res, 'Not authenticated');
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const category = req.query.category as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId: req.user.id };
    
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    // Get complaints
    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        select: {
          id: true,
          complaintId: true,
          category: true,
          title: true,
          address: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.complaint.count({ where })
    ]);

    const response: PaginatedResponse<typeof complaints[0]> = {
      items: complaints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    sendSuccess(res, 200, 'Complaints retrieved successfully', response);
  } catch (error) {
    console.error('Get my complaints error:', error);
    serverError(res);
  }
};

// ============================================
// GET SINGLE COMPLAINT (User)
// ============================================
export const getMyComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      forbidden(res, 'Not authenticated');
      return;
    }

    const { id } = req.params;

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { id },
          { complaintId: id }
        ],
        userId: req.user.id
      },
      include: {
        images: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            path: true
          }
        }
      }
    });

    if (!complaint) {
      notFound(res, 'Complaint not found');
      return;
    }

    sendSuccess(res, 200, 'Complaint retrieved successfully', complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    serverError(res);
  }
};

// ============================================
// GET COMPLAINT STATUS (User)
// ============================================
export const getComplaintStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      forbidden(res, 'Not authenticated');
      return;
    }

    const { id } = req.params;

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { id },
          { complaintId: id }
        ],
        userId: req.user.id
      },
      select: {
        complaintId: true,
        status: true,
        adminRemarks: true,
        updatedAt: true
      }
    });

    if (!complaint) {
      notFound(res, 'Complaint not found');
      return;
    }

    sendSuccess(res, 200, 'Status retrieved successfully', complaint);
  } catch (error) {
    console.error('Get complaint status error:', error);
    serverError(res);
  }
};
