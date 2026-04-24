import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { complaintApi } from '../../services/api';
import { ComplaintListItem, ComplaintFilters, ISSUE_CATEGORIES, COMPLAINT_STATUSES, CATEGORY_LABELS } from '../../types';
import { Button, Select, Card, CardBody, StatusBadge, CategoryBadge, LoadingPage } from '../../components/ui';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ComplaintFilters>({ page: 1, limit: 10 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await complaintApi.getMyComplaints(filters);
      if (response.success && response.data) {
        setComplaints(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const handleFilterChange = (key: keyof ComplaintFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page on filter change
    }));
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
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
          <p className="text-slate-600 mt-1">
            Track and manage your road condition reports
          </p>
        </div>
        <Link to="/report">
          <Button size="lg">
            <PlusCircle className="w-5 h-5 mr-2" />
            Report New Issue
          </Button>
        </Link>
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
            {(filters.status || filters.category) && (
              <Button
                variant="ghost"
                onClick={() => setFilters({ page: 1, limit: 10 })}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      {isLoading ? (
        <LoadingPage message="Loading your complaints..." />
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
            <p className="text-slate-600 mb-6">
              {filters.status || filters.category
                ? 'No complaints match your current filters. Try adjusting your filters.'
                : "You haven't submitted any road condition reports yet."}
            </p>
            {!filters.status && !filters.category && (
              <Link to="/report">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Report Your First Issue
                </Button>
              </Link>
            )}
          </CardBody>
        </Card>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Showing {complaints.length} of {total} complaint{total !== 1 ? 's' : ''}
          </p>
          
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <Card
                key={complaint.id}
                hoverable
                onClick={() => navigate(`/complaints/${complaint.complaintId}`)}
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
                      <h3 className="font-medium text-slate-900 mb-1 truncate">
                        {complaint.title || CATEGORY_LABELS[complaint.category]}
                      </h3>
                      <p className="text-sm text-slate-600 truncate mb-2">
                        {complaint.address}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <CategoryBadge category={complaint.category} />
                        <span>{formatDate(complaint.createdAt)}</span>
                      </div>
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
