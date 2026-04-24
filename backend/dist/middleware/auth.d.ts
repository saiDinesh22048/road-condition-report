import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { UserRole } from '../config/constants';
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authorize: (...allowedRoles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: ((req: AuthenticatedRequest, res: Response, next: NextFunction) => void)[];
export declare const requireUser: ((req: AuthenticatedRequest, res: Response, next: NextFunction) => void)[];
//# sourceMappingURL=auth.d.ts.map