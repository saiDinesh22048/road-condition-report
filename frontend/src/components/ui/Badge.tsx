import React from 'react';
import { ComplaintStatus, IssueCategory, CATEGORY_LABELS } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

const statusStyles: Record<ComplaintStatus, string> = {
  'Submitted': 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  'Assigned': 'bg-purple-100 text-purple-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${statusStyles[status] || 'bg-slate-100 text-slate-800'}
        ${className}
      `}
    >
      {status}
    </span>
  );
};

interface CategoryBadgeProps {
  category: IssueCategory;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded text-xs font-medium
        bg-slate-100 text-slate-700
        ${className}
      `}
    >
      {CATEGORY_LABELS[category] || category}
    </span>
  );
};
