import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const adminLogin: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const requestPasswordReset: (req: Request, res: Response) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map