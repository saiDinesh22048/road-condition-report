import { Response } from 'express';
import { ValidationError } from '../types';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare const sendError: (res: Response, statusCode: number, message: string, errors?: ValidationError[]) => Response;
export declare const sendSuccess: <T>(res: Response, statusCode: number, message: string, data?: T) => Response;
export declare const badRequest: (res: Response, message: string, errors?: ValidationError[]) => Response<any, Record<string, any>>;
export declare const unauthorized: (res: Response, message?: string) => Response<any, Record<string, any>>;
export declare const forbidden: (res: Response, message?: string) => Response<any, Record<string, any>>;
export declare const notFound: (res: Response, message?: string) => Response<any, Record<string, any>>;
export declare const conflict: (res: Response, message: string) => Response<any, Record<string, any>>;
export declare const serverError: (res: Response, message?: string) => Response<any, Record<string, any>>;
export declare const formatValidationErrors: (errors: Array<{
    path: string;
    msg: string;
}>) => ValidationError[];
//# sourceMappingURL=errorHandler.d.ts.map