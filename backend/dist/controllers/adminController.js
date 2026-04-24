"use strict";
// Admin Controller
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectComplaint = exports.acceptComplaint = exports.getAnalytics = exports.addAdminRemarks = exports.updateComplaintStatus = exports.getComplaintDetail = exports.getAllComplaints = void 0;
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const constants_1 = require("../config/constants");
const prisma = new client_1.PrismaClient();
// ============================================
// GET ALL COMPLAINTS (Admin)
// ============================================
const getAllComplaints = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            (0, errorHandler_1.forbidden)(res, 'Admin access required');
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const category = req.query.category;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        if (status) {
            if (!(0, constants_1.isValidStatus)(status)) {
                (0, errorHandler_1.badRequest)(res, `Invalid status. Allowed: ${constants_1.COMPLAINT_STATUSES.join(', ')}`);
                return;
            }
            where.status = status;
        }
        if (category) {
            if (!constants_1.ISSUE_CATEGORIES.includes(category)) {
                (0, errorHandler_1.badRequest)(res, `Invalid category. Allowed: ${constants_1.ISSUE_CATEGORIES.join(', ')}`);
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
        const response = {
            items: complaints,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
        (0, errorHandler_1.sendSuccess)(res, 200, 'Complaints retrieved successfully', response);
    }
    catch (error) {
        console.error('Get all complaints error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.getAllComplaints = getAllComplaints;
// ============================================
// GET SINGLE COMPLAINT DETAIL (Admin)
// ============================================
const getComplaintDetail = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            (0, errorHandler_1.forbidden)(res, 'Admin access required');
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
            (0, errorHandler_1.notFound)(res, 'Complaint not found');
            return;
        }
        (0, errorHandler_1.sendSuccess)(res, 200, 'Complaint retrieved successfully', complaint);
    }
    catch (error) {
        console.error('Get complaint detail error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.getComplaintDetail = getComplaintDetail;
// ============================================
// UPDATE COMPLAINT STATUS (Admin)
// ============================================
const updateComplaintStatus = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            (0, errorHandler_1.forbidden)(res, 'Admin access required');
            return;
        }
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            (0, errorHandler_1.badRequest)(res, 'Validation failed', (0, errorHandler_1.formatValidationErrors)(errors.array()));
            return;
        }
        const { id } = req.params;
        const { status, adminRemarks } = req.body;
        // Validate status
        if (!(0, constants_1.isValidStatus)(status)) {
            (0, errorHandler_1.badRequest)(res, `Invalid status. Allowed: ${constants_1.COMPLAINT_STATUSES.join(', ')}`);
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
            (0, errorHandler_1.notFound)(res, 'Complaint not found');
            return;
        }
        // Check if transition is valid
        const currentStatus = complaint.status;
        const newStatus = status;
        if (!(0, constants_1.isValidTransition)(currentStatus, newStatus)) {
            (0, errorHandler_1.badRequest)(res, `Invalid status transition from "${currentStatus}" to "${newStatus}"`);
            return;
        }
        // Require remarks for rejection
        if (newStatus === 'Rejected' && !adminRemarks?.trim()) {
            (0, errorHandler_1.badRequest)(res, 'Admin remarks are required when rejecting a complaint');
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
        (0, errorHandler_1.sendSuccess)(res, 200, 'Complaint status updated successfully', {
            id: updatedComplaint.id,
            complaintId: updatedComplaint.complaintId,
            status: updatedComplaint.status,
            adminRemarks: updatedComplaint.adminRemarks,
            updatedAt: updatedComplaint.updatedAt
        });
    }
    catch (error) {
        console.error('Update complaint status error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
// ============================================
// ADD ADMIN REMARKS (Admin)
// ============================================
const addAdminRemarks = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            (0, errorHandler_1.forbidden)(res, 'Admin access required');
            return;
        }
        const { id } = req.params;
        const { remarks } = req.body;
        if (!remarks?.trim()) {
            (0, errorHandler_1.badRequest)(res, 'Remarks are required');
            return;
        }
        if (remarks.length > 1000) {
            (0, errorHandler_1.badRequest)(res, 'Remarks must be at most 1000 characters');
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
            (0, errorHandler_1.notFound)(res, 'Complaint not found');
            return;
        }
        // Update remarks
        const updatedComplaint = await prisma.complaint.update({
            where: { id: complaint.id },
            data: { adminRemarks: remarks.trim() }
        });
        (0, errorHandler_1.sendSuccess)(res, 200, 'Remarks added successfully', {
            id: updatedComplaint.id,
            complaintId: updatedComplaint.complaintId,
            adminRemarks: updatedComplaint.adminRemarks
        });
    }
    catch (error) {
        console.error('Add remarks error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.addAdminRemarks = addAdminRemarks;
// ============================================
// GET ANALYTICS (Admin)
// ============================================
const getAnalytics = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            (0, errorHandler_1.forbidden)(res, 'Admin access required');
            return;
        }
        // Get total counts
        const [totalComplaints, resolvedComplaints, rejectedComplaints, categoryStats, statusStats] = await Promise.all([
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
                status: { in: constants_1.PENDING_STATUSES }
            }
        });
        // Map all categories including zero counts
        const complaintsByCategory = constants_1.ISSUE_CATEGORIES.map(cat => {
            const found = categoryStats.find((s) => s.category === cat);
            return {
                category: cat,
                count: found?._count?.category || 0
            };
        });
        // Map all statuses including zero counts
        const complaintsByStatus = constants_1.COMPLAINT_STATUSES.map(stat => {
            const found = statusStats.find((s) => s.status === stat);
            return {
                status: stat,
                count: found?._count?.status || 0
            };
        });
        const analytics = {
            totalComplaints,
            pendingComplaints,
            resolvedComplaints,
            rejectedComplaints,
            complaintsByCategory,
            complaintsByStatus
        };
        (0, errorHandler_1.sendSuccess)(res, 200, 'Analytics retrieved successfully', analytics);
    }
    catch (error) {
        console.error('Get analytics error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.getAnalytics = getAnalytics;
// ============================================
// ACCEPT COMPLAINT (Admin - Move to Under Review)
// ============================================
const acceptComplaint = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            (0, errorHandler_1.forbidden)(res, 'Admin access required');
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
            (0, errorHandler_1.notFound)(res, 'Complaint not found');
            return;
        }
        // Check if complaint is in Submitted status
        if (complaint.status !== 'Submitted') {
            (0, errorHandler_1.badRequest)(res, 'Only submitted complaints can be accepted');
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
        (0, errorHandler_1.sendSuccess)(res, 200, 'Complaint accepted and moved to Under Review', {
            id: updatedComplaint.id,
            complaintId: updatedComplaint.complaintId,
            status: updatedComplaint.status,
            updatedAt: updatedComplaint.updatedAt
        });
    }
    catch (error) {
        console.error('Accept complaint error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.acceptComplaint = acceptComplaint;
// ============================================
// REJECT COMPLAINT (Admin)
// ============================================
const rejectComplaint = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            (0, errorHandler_1.forbidden)(res, 'Admin access required');
            return;
        }
        const { id } = req.params;
        const { remarks } = req.body;
        if (!remarks?.trim()) {
            (0, errorHandler_1.badRequest)(res, 'Remarks are required when rejecting a complaint');
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
            (0, errorHandler_1.notFound)(res, 'Complaint not found');
            return;
        }
        // Check if complaint can be rejected
        const unrejectableStatuses = ['Resolved', 'Rejected'];
        if (unrejectableStatuses.includes(complaint.status)) {
            (0, errorHandler_1.badRequest)(res, `Cannot reject a complaint that is ${complaint.status.toLowerCase()}`);
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
        (0, errorHandler_1.sendSuccess)(res, 200, 'Complaint rejected', {
            id: updatedComplaint.id,
            complaintId: updatedComplaint.complaintId,
            status: updatedComplaint.status,
            adminRemarks: updatedComplaint.adminRemarks,
            updatedAt: updatedComplaint.updatedAt
        });
    }
    catch (error) {
        console.error('Reject complaint error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.rejectComplaint = rejectComplaint;
//# sourceMappingURL=adminController.js.map