import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const createComplaint: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMyComplaints: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMyComplaint: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getComplaintStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=complaintController.d.ts.map