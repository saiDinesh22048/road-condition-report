// File Upload Middleware using Multer

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FILE_UPLOAD_CONFIG } from '../config/constants';

// ============================================
// ENSURE UPLOAD DIRECTORY EXISTS
// ============================================
const uploadDir = path.join(process.cwd(), FILE_UPLOAD_CONFIG.uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================
// STORAGE CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    // Create date-based subdirectory
    const dateDir = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fullPath = path.join(uploadDir, dateDir);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with original extension
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

// ============================================
// FILE FILTER
// ============================================
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  // Check if file type is allowed
  if (FILE_UPLOAD_CONFIG.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${FILE_UPLOAD_CONFIG.allowedTypes.join(', ')}`));
  }
};

// ============================================
// MULTER CONFIGURATION
// ============================================
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD_CONFIG.maxSizeMB * 1024 * 1024, // Convert MB to bytes
    files: 5 // Maximum 5 files per upload
  }
});

// ============================================
// UPLOAD ERROR HANDLER
// ============================================
export const handleUploadError = (error: Error): string => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return `File too large. Maximum size is ${FILE_UPLOAD_CONFIG.maxSizeMB}MB`;
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

// ============================================
// HELPER TO DELETE UPLOADED FILES
// ============================================
export const deleteUploadedFile = (filePath: string): void => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// ============================================
// GET RELATIVE PATH FOR STORAGE
// ============================================
export const getRelativePath = (fullPath: string): string => {
  const uploadsIndex = fullPath.indexOf(FILE_UPLOAD_CONFIG.uploadDir);
  if (uploadsIndex !== -1) {
    return fullPath.substring(uploadsIndex).replace(/\\/g, '/');
  }
  return fullPath.replace(/\\/g, '/');
};
