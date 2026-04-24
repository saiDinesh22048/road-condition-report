// Routes Index

import { Router } from 'express';
import authRoutes from './authRoutes';
import complaintRoutes from './complaintRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin', adminRoutes);

export default router;
