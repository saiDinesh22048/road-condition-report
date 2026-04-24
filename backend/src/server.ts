// Main Server Entry Point

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import routes from './routes';
import { AppError, sendError, serverError } from './utils/errorHandler';
import { FILE_UPLOAD_CONFIG } from './config/constants';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use(
  `/${FILE_UPLOAD_CONFIG.uploadDir}`,
  express.static(path.join(process.cwd(), FILE_UPLOAD_CONFIG.uploadDir))
);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api', routes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((_req: Request, res: Response) => {
  sendError(res, 404, 'Route not found');
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    sendError(res, 400, 'Database operation failed');
    return;
  }

  if (err.name === 'PrismaClientValidationError') {
    sendError(res, 400, 'Invalid data provided');
    return;
  }

  serverError(res);
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     Road Condition Reporting App - Backend Server          ║
╠════════════════════════════════════════════════════════════╣
║  Status: Running                                           ║
║  Port: ${PORT}                                                 ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  API Base: http://localhost:${PORT}/api                       ║
║  Health Check: http://localhost:${PORT}/health                ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
