// Admin Controller

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
  PaginatedResponse,
  AnalyticsSummary,
  ComplaintDetail
} from '../types';
import {
  isValidStatus,
  isValidTransition,
  COMPLAINT_STATUSES,
  PENDING_STATUSES,
  ISSUE_CATEGORIES,
  ComplaintStatus
} from '../config/constants';

const prisma = new PrismaClient();

// ============================================
// GET ALL COMPLAINTS (Admin)
// ============================================
export const getAllComplaints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      forbidden(res, 'Admin access required');
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const category = req.query.category as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      if (!isValidStatus(status)) {
        badRequest(res, `Invalid status. Allowed: ${COMPLAINT_STATUSES.join(', ')}`);
        return;
      }
      where.status = status;
    }
    
    if (category) {
      if (!ISSUE_CATEGORIES.includes(category as any)) {
        badRequest(res, `Invalid category. Allowed: ${ISSUE_CATEGORIES.join(', ')}`);
        return;
      }
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
          description: true,
          address: true,
          status: true,
          adminRemarks: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          images: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              path: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
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
    console.error('Get all complaints error:', error);
    serverError(res);
  }
};

// ============================================
// GET SINGLE COMPLAINT DETAIL (Admin)
// ============================================
export const getComplaintDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      forbidden(res, 'Admin access required');
      return;
    }

    const { id } = req.params;

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { id },
          { complaintId: id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
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
    console.error('Get complaint detail error:', error);
    serverError(res);
  }
};

// ============================================
// UPDATE COMPLAINT STATUS (Admin)
// ============================================
export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      forbidden(res, 'Admin access required');
      return;
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      badRequest(res, 'Validation failed', formatValidationErrors(errors.array() as any));
      return;
    }

    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    // Validate status
    if (!isValidStatus(status)) {
      badRequest(res, `Invalid status. Allowed: ${COMPLAINT_STATUSES.join(', ')}`);
      return;
    }

    // Find complaint
    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { id },
          { complaintId: id }
        ]
      }
    });

    if (!complaint) {
      notFound(res, 'Complaint not found');
      return;
    }

    // Check if transition is valid
    const currentStatus = complaint.status as ComplaintStatus;
    const newStatus = status as ComplaintStatus;

    if (!isValidTransition(currentStatus, newStatus)) {
      badRequest(res, `Invalid status transition from "${currentStatus}" to "${newStatus}"`);
      return;
    }

    // Require remarks for rejection
    if (newStatus === 'Rejected' && !adminRemarks?.trim()) {
      badRequest(res, 'Admin remarks are required when rejecting a complaint');
      return;
    }

    // Update complaint
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: newStatus,
        adminRemarks: adminRemarks?.trim() || complaint.adminRemarks
      },
      include: {
        images: {
          select: {
            id: true,
            path: true
          }
        }
      }
    });

    sendSuccess(res, 200, 'Complaint status updated successfully', {
      id: updatedComplaint.id,
      complaintId: updatedComplaint.complaintId,
      status: updatedComplaint.status,
      adminRemarks: updatedComplaint.adminRemarks,
      updatedAt: updatedComplaint.updatedAt
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    serverError(res);
  }
};

// ============================================
// ADD ADMIN REMARKS (Admin)
// ============================================
export const addAdminRemarks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      forbidden(res, 'Admin access required');
      return;
    }

    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks?.trim()) {
      badRequest(res, 'Remarks are required');
      return;
    }

    if (remarks.length > 1000) {
      badRequest(res, 'Remarks must be at most 1000 characters');
      return;
    }

    // Find complaint
    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { id },
          { complaintId: id }
        ]
      }
    });

    if (!complaint) {
      notFound(res, 'Complaint not found');
      return;
    }

    // Update remarks
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaint.id },
      data: { adminRemarks: remarks.trim() }
    });

    sendSuccess(res, 200, 'Remarks added successfully', {
      id: updatedComplaint.id,
      complaintId: updatedComplaint.complaintId,
      adminRemarks: updatedComplaint.adminRemarks
    });
  } catch (error) {
    console.error('Add remarks error:', error);
    serverError(res);
  }
};

// ============================================
// GET ANALYTICS (Admin)
// ============================================
export const getAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      forbidden(res, 'Admin access required');
      return;
    }

    // Get total counts
    const [
      totalComplaints,
      resolvedComplaints,
      rejectedComplaints,
      categoryStats,
      statusStats
    ] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'Resolved' } }),
      prisma.complaint.count({ where: { status: 'Rejected' } }),
      prisma.complaint.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.complaint.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    // Calculate pending complaints (all non-resolved, non-rejected)
    const pendingComplaints = await prisma.complaint.count({
      where: {
        status: { in: PENDING_STATUSES }
      }
    });

    // Map all categories including zero counts
    const complaintsByCategory = ISSUE_CATEGORIES.map(cat => {
      const found = categoryStats.find((s: { category: string; _count: { category: number } }) => s.category === cat);
      return {
        category: cat,
        count: found?._count?.category || 0
      };
    });

    // Map all statuses including zero counts
    const complaintsByStatus = COMPLAINT_STATUSES.map(stat => {
      const found = statusStats.find((s: { status: string; _count: { status: number } }) => s.status === stat);
      return {
        status: stat,
        count: found?._count?.status || 0
      };
    });

    const analytics: AnalyticsSummary = {
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      rejectedComplaints,
      complaintsByCategory,
      complaintsByStatus
    };

    sendSuccess(res, 200, 'Analytics retrieved successfully', analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    serverError(res);
  }
};

// ============================================
// ACCEPT COMPLAINT (Admin - Move to Under Review)
// ============================================
export const acceptComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      forbidden(res, 'Admin access required');
      return;
    }

    const { id } = req.params;
    const { remarks } = req.body;

    // Find complaint
    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { id },
          { complaintId: id }
        ]
      }
    });

    if (!complaint) {
      notFound(res, 'Complaint not found');
      return;
    }

    // Check if complaint is in Submitted status
    if (complaint.status !== 'Submitted') {
      badRequest(res, 'Only submitted complaints can be accepted');
      return;
    }

    // Update to Under Review
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: 'Under Review',
        adminRemarks: remarks?.trim() || null
      }
    });

    sendSuccess(res, 200, 'Complaint accepted and moved to Under Review', {
      id: updatedComplaint.id,
      complaintId: updatedComplaint.complaintId,
      status: updatedComplaint.status,
      updatedAt: updatedComplaint.updatedAt
    });
  } catch (error) {
    console.error('Accept complaint error:', error);
    serverError(res);
  }
};

// ============================================
// REJECT COMPLAINT (Admin)
// ============================================
export const rejectComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      forbidden(res, 'Admin access required');
      return;
    }

    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks?.trim()) {
      badRequest(res, 'Remarks are required when rejecting a complaint');
      return;
    }

    // Find complaint
    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { id },
          { complaintId: id }
        ]
      }
    });

    if (!complaint) {
      notFound(res, 'Complaint not found');
      return;
    }

    // Check if complaint can be rejected
    const unrejectableStatuses: ComplaintStatus[] = ['Resolved', 'Rejected'];
    if (unrejectableStatuses.includes(complaint.status as ComplaintStatus)) {
      badRequest(res, `Cannot reject a complaint that is ${complaint.status.toLowerCase()}`);
      return;
    }

    // Update to Rejected
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: 'Rejected',
        adminRemarks: remarks.trim()
      }
    });

    sendSuccess(res, 200, 'Complaint rejected', {
      id: updatedComplaint.id,
      complaintId: updatedComplaint.complaintId,
      status: updatedComplaint.status,
      adminRemarks: updatedComplaint.adminRemarks,
      updatedAt: updatedComplaint.updatedAt
    });
  } catch (error) {
    console.error('Reject complaint error:', error);
    serverError(res);
  }
};
