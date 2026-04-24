export declare const ISSUE_CATEGORIES: readonly ["pothole", "crack", "waterlogging", "debris on road", "damaged signboard", "damaged divider", "blocked drainage"];
export type IssueCategory = typeof ISSUE_CATEGORIES[number];
export declare const COMPLAINT_STATUSES: readonly ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"];
export type ComplaintStatus = typeof COMPLAINT_STATUSES[number];
export declare const STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]>;
export declare const USER_ROLES: readonly ["USER", "ADMIN"];
export type UserRole = typeof USER_ROLES[number];
export declare const PENDING_STATUSES: ComplaintStatus[];
export declare const VALIDATION_RULES: {
    password: {
        minLength: number;
        maxLength: number;
    };
    name: {
        minLength: number;
        maxLength: number;
    };
    description: {
        minLength: number;
        maxLength: number;
    };
    address: {
        minLength: number;
        maxLength: number;
    };
    title: {
        maxLength: number;
    };
    adminRemarks: {
        maxLength: number;
    };
    phone: {
        pattern: RegExp;
    };
};
export declare const FILE_UPLOAD_CONFIG: {
    maxSizeMB: number;
    allowedTypes: string[];
    uploadDir: string;
};
export declare const generateComplaintId: (sequenceNumber: number) => string;
export declare const isValidCategory: (category: string) => category is IssueCategory;
export declare const isValidStatus: (status: string) => status is ComplaintStatus;
export declare const isValidTransition: (currentStatus: ComplaintStatus, newStatus: ComplaintStatus) => boolean;
export declare const isPendingStatus: (status: ComplaintStatus) => boolean;
//# sourceMappingURL=constants.d.ts.map