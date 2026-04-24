"use strict";
// Complaint Routes (User)
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaintController_1 = require("../controllers/complaintController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../utils/errorHandler");
const router = (0, express_1.Router)();
// File upload error handling middleware
const handleFileUploadErrors = (err, req, res, next) => {
    if (err) {
        const message = (0, upload_1.handleUploadError)(err);
        (0, errorHandler_1.badRequest)(res, message);
        return;
    }
    next();
};
// Create complaint with image upload
router.post('/', auth_1.requireAuth, upload_1.upload.array('images', 5), handleFileUploadErrors, validation_1.validateCreateComplaint, complaintController_1.createComplaint);
// Get my complaints
router.get('/', auth_1.requireAuth, validation_1.validateComplaintFilters, complaintController_1.getMyComplaints);
// Get single complaint
router.get('/:id', auth_1.requireAuth, validation_1.validateComplaintId, complaintController_1.getMyComplaint);
// Get complaint status
router.get('/:id/status', auth_1.requireAuth, validation_1.validateComplaintId, complaintController_1.getComplaintStatus);
exports.default = router;
//# sourceMappingURL=complaintRoutes.js.map