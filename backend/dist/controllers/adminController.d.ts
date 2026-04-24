import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const getAllComplaints: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getComplaintDetail: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateComplaintStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const addAdminRemarks: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAnalytics: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const acceptComplaint: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const rejectComplaint: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map