"use strict";
// Main Server Entry Point
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./utils/errorHandler");
const constants_1 = require("./config/constants");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000', 10);
// ============================================
// MIDDLEWARE
// ============================================
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Parse JSON bodies
app.use(express_1.default.json({ limit: '10mb' }));
// Parse URL-encoded bodies
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Serve uploaded files statically
app.use(`/${constants_1.FILE_UPLOAD_CONFIG.uploadDir}`, express_1.default.static(path_1.default.join(process.cwd(), constants_1.FILE_UPLOAD_CONFIG.uploadDir)));
// ============================================
// ROUTES
// ============================================
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// API routes
app.use('/api', routes_1.default);
// ============================================
// ERROR HANDLING
// ============================================
// 404 handler
app.use((_req, res) => {
    (0, errorHandler_1.sendError)(res, 404, 'Route not found');
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    if (err instanceof errorHandler_1.AppError) {
        (0, errorHandler_1.sendError)(res, err.statusCode, err.message);
        return;
    }
    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        (0, errorHandler_1.sendError)(res, 400, 'Database operation failed');
        return;
    }
    if (err.name === 'PrismaClientValidationError') {
        (0, errorHandler_1.sendError)(res, 400, 'Invalid data provided');
        return;
    }
    (0, errorHandler_1.serverError)(res);
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
exports.default = app;
//# sourceMappingURL=server.js.map