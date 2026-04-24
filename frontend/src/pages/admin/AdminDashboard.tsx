import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { AnalyticsSummary, CATEGORY_LABELS, IssueCategory } from '../../types';
import { Card, CardBody, CardHeader, LoadingPage } from '../../components/ui';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await adminApi.getAnalytics();
        if (response.success && response.data) {
          setAnalytics(response.data);
        }
      } catch (error: any) {
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900">Unable to load analytics</h2>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Complaints',
      value: analytics.totalComplaints,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/complaints',
    },
    {
      title: 'Pending',
      value: analytics.pendingComplaints,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/admin/complaints?status=Submitted',
    },
    {
      title: 'Resolved',
      value: analytics.resolvedComplaints,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/admin/complaints?status=Resolved',
    },
    {
      title: 'Rejected',
      value: analytics.rejectedComplaints,
      icon: XCircle,
      color: 'bg-red-500',
      link: '/admin/complaints?status=Rejected',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of road condition complaints</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card hoverable className="h-full">
              <CardBody className="py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Category */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Complaints by Category</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {analytics.complaintsByCategory.map((item) => {
                const percentage = analytics.totalComplaints > 0
                  ? Math.round((item.count / analytics.totalComplaints) * 100)
                  : 0;
                
                return (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">
                        {CATEGORY_LABELS[item.category as IssueCategory] || item.category}
                      </span>
                      <span className="text-slate-500">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {analytics.complaintsByCategory.every(c => c.count === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No complaints data available
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Complaints by Status */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Complaints by Status</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {analytics.complaintsByStatus.map((item) => {
                const percentage = analytics.totalComplaints > 0
                  ? Math.round((item.count / analytics.totalComplaints) * 100)
                  : 0;
                
                const statusColors: Record<string, string> = {
                  'Submitted': 'bg-blue-500',
                  'Under Review': 'bg-yellow-500',
                  'Assigned': 'bg-purple-500',
                  'In Progress': 'bg-orange-500',
                  'Resolved': 'bg-green-500',
                  'Rejected': 'bg-red-500',
                };

                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{item.status}</span>
                      <span className="text-slate-500">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${statusColors[item.status] || 'bg-slate-400'} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {analytics.complaintsByStatus.every(s => s.count === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No complaints data available
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Quick Actions</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/complaints?status=Submitted"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-900">New Complaints</p>
                <p className="text-sm text-slate-600">
                  {analytics.complaintsByStatus.find(s => s.status === 'Submitted')?.count || 0} awaiting review
                </p>
              </div>
            </Link>

            <Link
              to="/admin/complaints?status=Under Review"
              className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Under Review</p>
                <p className="text-sm text-slate-600">
                  {analytics.complaintsByStatus.find(s => s.status === 'Under Review')?.count || 0} being reviewed
                </p>
              </div>
            </Link>

            <Link
              to="/admin/complaints?status=In Progress"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-900">In Progress</p>
                <p className="text-sm text-slate-600">
                  {analytics.complaintsByStatus.find(s => s.status === 'In Progress')?.count || 0} in progress
                </p>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
