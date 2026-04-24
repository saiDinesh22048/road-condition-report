import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { complaintApi } from '../../services/api';
import { Complaint, CATEGORY_LABELS } from '../../types';
import { Card, CardBody, CardHeader, StatusBadge, CategoryBadge, LoadingPage, Button } from '../../components/ui';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await complaintApi.getMyComplaint(id);
        if (response.success && response.data) {
          setComplaint(response.data);
        } else {
          toast.error('Complaint not found');
          navigate('/dashboard');
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to load complaint';
        toast.error(message);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaint();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingPage message="Loading complaint details..." />;
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Complaint Not Found</h2>
        <p className="text-slate-600 mb-4">The complaint you're looking for doesn't exist.</p>
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to My Complaints
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {complaint.complaintId}
              </h1>
              <StatusBadge status={complaint.status} />
            </div>
            <CategoryBadge category={complaint.category} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Complaint Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {complaint.title && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Title</h3>
                <p className="text-slate-900">{complaint.title}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Category</h3>
              <p className="text-slate-900">{CATEGORY_LABELS[complaint.category]}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Description</h3>
              <p className="text-slate-900 whitespace-pre-wrap">{complaint.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Location
              </h3>
              <p className="text-slate-900">{complaint.address}</p>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Submitted Date
                </h3>
                <p className="text-slate-900">{formatDate(complaint.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Submitted Time
                </h3>
                <p className="text-slate-900">{formatTime(complaint.createdAt)}</p>
              </div>
            </div>

            {complaint.createdAt !== complaint.updatedAt && (
              <div className="text-sm text-slate-500 pt-2 border-t">
                Last updated: {formatDate(complaint.updatedAt)} at {formatTime(complaint.updatedAt)}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Admin Remarks */}
        {complaint.adminRemarks && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Admin Remarks
              </h2>
            </CardHeader>
            <CardBody>
              <p className="text-slate-700 whitespace-pre-wrap">{complaint.adminRemarks}</p>
            </CardBody>
          </Card>
        )}

        {/* Images */}
        {complaint.images && complaint.images.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Photos ({complaint.images.length})
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {complaint.images.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(`/${image.path}`)}
                  >
                    <img
                      src={`/${image.path}`}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Current Status</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <StatusBadge status={complaint.status} />
              <span className="text-slate-600">
                {complaint.status === 'Submitted' && 'Your complaint has been received and is awaiting review.'}
                {complaint.status === 'Under Review' && 'Your complaint is being reviewed by our team.'}
                {complaint.status === 'Assigned' && 'Your complaint has been assigned for action.'}
                {complaint.status === 'In Progress' && 'Work is in progress to resolve the issue.'}
                {complaint.status === 'Resolved' && 'The issue has been resolved.'}
                {complaint.status === 'Rejected' && 'Your complaint has been rejected. See admin remarks for details.'}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
            >
              <ArrowLeft className="w-6 h-6 rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
