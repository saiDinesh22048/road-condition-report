import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, AlertCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { Complaint, ComplaintFilters, ISSUE_CATEGORIES, COMPLAINT_STATUSES, CATEGORY_LABELS } from '../../types';
import { Button, Select, Card, CardBody, StatusBadge, CategoryBadge, LoadingPage } from '../../components/ui';

export const AdminComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState<ComplaintFilters & { sortBy?: string; sortOrder?: string }>({
    status: searchParams.get('status') as any || undefined,
    category: searchParams.get('category') as any || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAllComplaints(filters);
      if (response.success && response.data) {
        setComplaints(response.data.items);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (error: any) {
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    
    // Update URL params
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    setSearchParams(params);
  }, [filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const categoryOptions = ISSUE_CATEGORIES.map((cat) => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
  }));

  const statusOptions = COMPLAINT_STATUSES.map((status) => ({
    value: status,
    label: status,
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasFilters = filters.status || filters.category;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Complaints</h1>
        <p className="text-slate-600 mt-1">
          Manage and review road condition reports
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                options={statusOptions}
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                placeholder="All Statuses"
              />
            </div>
            <div className="flex-1">
              <Select
                options={categoryOptions}
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                placeholder="All Categories"
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      {isLoading ? (
        <LoadingPage message="Loading complaints..." />
      ) : complaints.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No complaints found
            </h3>
            <p className="text-slate-600">
              {hasFilters
                ? 'No complaints match your current filters. Try adjusting your filters.'
                : 'There are no complaints in the system yet.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Showing {complaints.length} of {total} complaint{total !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Complaints Table/List */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                        ID / User
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                        Category
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                        Location
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                        Date
                      </th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {complaints.map((complaint) => (
                      <tr
                        key={complaint.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/admin/complaints/${complaint.complaintId}`)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-mono font-medium text-slate-900">
                              {complaint.complaintId}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center mt-1">
                              <User className="w-3 h-3 mr-1" />
                              {complaint.user?.name || 'Unknown'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <CategoryBadge category={complaint.category} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 max-w-xs truncate">
                            {complaint.address}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={complaint.status} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-500">
                            {formatDate(complaint.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm">
                            View
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile List */}
          <div className="lg:hidden space-y-3">
            {complaints.map((complaint) => (
              <Card
                key={complaint.id}
                hoverable
                onClick={() => navigate(`/admin/complaints/${complaint.complaintId}`)}
              >
                <CardBody className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-slate-500">
                          {complaint.complaintId}
                        </span>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <p className="text-sm text-slate-600 truncate mb-2">
                        {complaint.address}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <CategoryBadge category={complaint.category} />
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {complaint.user?.name || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-slate-600">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page === totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
