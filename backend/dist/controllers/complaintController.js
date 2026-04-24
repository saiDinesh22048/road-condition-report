"use strict";
// Complaint Controller
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComplaintStatus = exports.getMyComplaint = exports.getMyComplaints = exports.createComplaint = void 0;
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const constants_1 = require("../config/constants");
const upload_1 = require("../middleware/upload");
const prisma = new client_1.PrismaClient();
// ============================================
// CREATE COMPLAINT
// ============================================
const createComplaint = async (req, res) => {
    try {
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            // Clean up uploaded files on validation error
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    (0, upload_1.deleteUploadedFile)(file.path);
                }
            }
            (0, errorHandler_1.badRequest)(res, 'Validation failed', (0, errorHandler_1.formatValidationErrors)(errors.array()));
            return;
        }
        if (!req.user) {
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    (0, upload_1.deleteUploadedFile)(file.path);
                }
            }
            (0, errorHandler_1.forbidden)(res, 'Not authenticated');
            return;
        }
        // Check for uploaded images
        const files = req.files;
        if (!files || files.length === 0) {
            (0, errorHandler_1.badRequest)(res, 'At least one image is required');
            return;
        }
        const { category, title, description, address } = req.body;
        // Validate category
        if (!(0, constants_1.isValidCategory)(category)) {
            for (const file of files) {
                (0, upload_1.deleteUploadedFile)(file.path);
            }
            (0, errorHandler_1.badRequest)(res, `Invalid category. Allowed categories: ${constants_1.ISSUE_CATEGORIES.join(', ')}`);
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
        const complaintId = (0, constants_1.generateComplaintId)(todayCount + 1);
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
                        path: (0, upload_1.getRelativePath)(file.path)
                    }))
                }
            },
            include: {
                images: true
            }
        });
        const response = {
            complaintId: complaint.complaintId,
            message: 'Complaint submitted successfully',
            submittedAt: complaint.createdAt
        };
        (0, errorHandler_1.sendSuccess)(res, 201, 'Complaint submitted successfully', response);
    }
    catch (error) {
        console.error('Create complaint error:', error);
        // Clean up files on error
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                (0, upload_1.deleteUploadedFile)(file.path);
            }
        }
        (0, errorHandler_1.serverError)(res, 'Failed to submit complaint. Please try again.');
    }
};
exports.createComplaint = createComplaint;
// ============================================
// GET MY COMPLAINTS (User)
// ============================================
const getMyComplaints = async (req, res) => {
    try {
        if (!req.user) {
            (0, errorHandler_1.forbidden)(res, 'Not authenticated');
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const category = req.query.category;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = { userId: req.user.id };
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
        console.error('Get my complaints error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.getMyComplaints = getMyComplaints;
// ============================================
// GET SINGLE COMPLAINT (User)
// ============================================
const getMyComplaint = async (req, res) => {
    try {
        if (!req.user) {
            (0, errorHandler_1.forbidden)(res, 'Not authenticated');
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
            (0, errorHandler_1.notFound)(res, 'Complaint not found');
            return;
        }
        (0, errorHandler_1.sendSuccess)(res, 200, 'Complaint retrieved successfully', complaint);
    }
    catch (error) {
        console.error('Get complaint error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.getMyComplaint = getMyComplaint;
// ============================================
// GET COMPLAINT STATUS (User)
// ============================================
const getComplaintStatus = async (req, res) => {
    try {
        if (!req.user) {
            (0, errorHandler_1.forbidden)(res, 'Not authenticated');
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
            (0, errorHandler_1.notFound)(res, 'Complaint not found');
            return;
        }
        (0, errorHandler_1.sendSuccess)(res, 200, 'Status retrieved successfully', complaint);
    }
    catch (error) {
        console.error('Get complaint status error:', error);
        (0, errorHandler_1.serverError)(res);
    }
};
exports.getComplaintStatus = getComplaintStatus;
//# sourceMappingURL=complaintController.js.map