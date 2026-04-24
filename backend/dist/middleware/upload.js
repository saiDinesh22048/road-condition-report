"use strict";
// File Upload Middleware using Multer
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativePath = exports.deleteUploadedFile = exports.handleUploadError = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const constants_1 = require("../config/constants");
// ============================================
// ENSURE UPLOAD DIRECTORY EXISTS
// ============================================
const uploadDir = path_1.default.join(process.cwd(), constants_1.FILE_UPLOAD_CONFIG.uploadDir);
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// ============================================
// STORAGE CONFIGURATION
// ============================================
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        // Create date-based subdirectory
        const dateDir = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const fullPath = path_1.default.join(uploadDir, dateDir);
        if (!fs_1.default.existsSync(fullPath)) {
            fs_1.default.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: (_req, file, cb) => {
        // Generate unique filename with original extension
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = `${(0, uuid_1.v4)()}${ext}`;
        cb(null, uniqueName);
    }
});
// ============================================
// FILE FILTER
// ============================================
const fileFilter = (_req, file, cb) => {
    // Check if file type is allowed
    if (constants_1.FILE_UPLOAD_CONFIG.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file type. Allowed types: ${constants_1.FILE_UPLOAD_CONFIG.allowedTypes.join(', ')}`));
    }
};
// ============================================
// MULTER CONFIGURATION
// ============================================
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: constants_1.FILE_UPLOAD_CONFIG.maxSizeMB * 1024 * 1024, // Convert MB to bytes
        files: 5 // Maximum 5 files per upload
    }
});
// ============================================
// UPLOAD ERROR HANDLER
// ============================================
const handleUploadError = (error) => {
    if (error instanceof multer_1.default.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return `File too large. Maximum size is ${constants_1.FILE_UPLOAD_CONFIG.maxSizeMB}MB`;
            case 'LIMIT_FILE_COUNT':
                return 'Too many files. Maximum is 5 files per upload';
            case 'LIMIT_UNEXPECTED_FILE':
                return 'Unexpected field name in file upload';
            default:
                return `Upload error: ${error.message}`;
        }
    }
    return error.message;
};
exports.handleUploadError = handleUploadError;
// ============================================
// HELPER TO DELETE UPLOADED FILES
// ============================================
const deleteUploadedFile = (filePath) => {
    const fullPath = path_1.default.join(process.cwd(), filePath);
    if (fs_1.default.existsSync(fullPath)) {
        fs_1.default.unlinkSync(fullPath);
    }
};
exports.deleteUploadedFile = deleteUploadedFile;
// ============================================
// GET RELATIVE PATH FOR STORAGE
// ============================================
const getRelativePath = (fullPath) => {
    const uploadsIndex = fullPath.indexOf(constants_1.FILE_UPLOAD_CONFIG.uploadDir);
    if (uploadsIndex !== -1) {
        return fullPath.substring(uploadsIndex).replace(/\\/g, '/');
    }
    return fullPath.replace(/\\/g, '/');
};
exports.getRelativePath = getRelativePath;
//# sourceMappingURL=upload.js.map