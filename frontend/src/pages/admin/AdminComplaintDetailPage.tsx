import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { Complaint, CATEGORY_LABELS, ComplaintStatus } from '../../types';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  StatusBadge,
  CategoryBadge,
  LoadingPage,
  Button,
  Select,
  TextArea,
} from '../../components/ui';

// Valid status transitions
const STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  'Submitted': ['Under Review', 'Rejected'],
  'Under Review': ['Assigned', 'Rejected'],
  'Assigned': ['In Progress', 'Under Review', 'Rejected'],
  'In Progress': ['Resolved', 'Assigned', 'Rejected'],
  'Resolved': [],
  'Rejected': [],
};

export const AdminComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Status update state
  const [newStatus, setNewStatus] = useState<ComplaintStatus | ''>('');
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const fetchComplaint = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await adminApi.getComplaintDetail(id);
      if (response.success && response.data) {
        setComplaint(response.data);
      } else {
        toast.error('Complaint not found');
        navigate('/admin/complaints');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load complaint';
      toast.error(message);
      navigate('/admin/complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleAccept = async () => {
    if (!complaint) return;
    
    setIsUpdating(true);
    try {
      const response = await adminApi.acceptComplaint(complaint.id, remarks || undefined);
      if (response.success) {
        toast.success('Complaint accepted and moved to Under Review');
        fetchComplaint();
        setRemarks('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept complaint');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!complaint || !rejectRemarks.trim()) {
      toast.error('Please provide remarks for rejection');
      return;
    }
    
    setIsUpdating(true);
    try {
      const response = await adminApi.rejectComplaint(complaint.id, rejectRemarks.trim());
      if (response.success) {
        toast.success('Complaint rejected');
        setShowRejectModal(false);
        setRejectRemarks('');
        fetchComplaint();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject complaint');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!complaint || !newStatus) return;
    
    // Check if remarks required for rejection
    if (newStatus === 'Rejected' && !remarks.trim()) {
      toast.error('Remarks are required when rejecting a complaint');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await adminApi.updateComplaintStatus(complaint.id, {
        status: newStatus,
        adminRemarks: remarks.trim() || undefined,
      });
      if (response.success) {
        toast.success('Status updated successfully');
        setNewStatus('');
        setRemarks('');
        fetchComplaint();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddRemarks = async () => {
    if (!complaint || !remarks.trim()) {
      toast.error('Please enter remarks');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await adminApi.addRemarks(complaint.id, remarks.trim());
      if (response.success) {
        toast.success('Remarks added successfully');
        setRemarks('');
        fetchComplaint();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add remarks');
    } finally {
      setIsUpdating(false);
    }
  };

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
        <Link to="/admin/complaints">
          <Button>Go to Complaints</Button>
        </Link>
      </div>
    );
  }

  const allowedTransitions = STATUS_TRANSITIONS[complaint.status as ComplaintStatus] || [];
  const canUpdateStatus = allowedTransitions.length > 0;
  const isTerminalStatus = complaint.status === 'Resolved' || complaint.status === 'Rejected';

  const statusOptions = allowedTransitions.map((status) => ({
    value: status,
    label: status,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/admin/complaints')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Complaints
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
          
          {/* Quick Actions */}
          {complaint.status === 'Submitted' && (
            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                isLoading={isUpdating}
                disabled={isUpdating}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowRejectModal(true)}
                disabled={isUpdating}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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

              <div className="flex flex-wrap gap-6 pt-2 border-t">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Submitted
                  </h3>
                  <p className="text-slate-900">
                    {formatDate(complaint.createdAt)} at {formatTime(complaint.createdAt)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Last Updated
                  </h3>
                  <p className="text-slate-900">
                    {formatDate(complaint.updatedAt)} at {formatTime(complaint.updatedAt)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Submitted By
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <p className="font-medium text-slate-900">{complaint.user?.name || 'Unknown'}</p>
              </div>
              {complaint.user?.email && (
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {complaint.user.email}
                </div>
              )}
              {complaint.user?.phone && (
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {complaint.user.phone}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Status Update */}
          {canUpdateStatus && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900">Update Status</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Current: {complaint.status}</p>
                  <Select
                    options={statusOptions}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    placeholder="Select new status"
                  />
                </div>
                <TextArea
                  placeholder="Add remarks (required for rejection)..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </CardBody>
              <CardFooter className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || isUpdating}
                  isLoading={isUpdating}
                >
                  Update Status
                </Button>
                {remarks.trim() && !newStatus && (
                  <Button
                    variant="secondary"
                    onClick={handleAddRemarks}
                    disabled={isUpdating}
                    isLoading={isUpdating}
                  >
                    Add Remarks Only
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}

          {/* Terminal Status Info */}
          {isTerminalStatus && (
            <Card>
              <CardBody className="text-center py-6">
                {complaint.status === 'Resolved' ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="font-medium text-slate-900">Complaint Resolved</p>
                    <p className="text-sm text-slate-500 mt-1">
                      This complaint has been resolved and cannot be updated.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="font-medium text-slate-900">Complaint Rejected</p>
                    <p className="text-sm text-slate-500 mt-1">
                      This complaint has been rejected and cannot be updated.
                    </p>
                  </>
                )}
              </CardBody>
            </Card>
          )}

          {/* Add Remarks Only (for non-terminal status without changing status) */}
          {!canUpdateStatus && !isTerminalStatus && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900">Add Remarks</h2>
              </CardHeader>
              <CardBody>
                <TextArea
                  placeholder="Add remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </CardBody>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleAddRemarks}
                  disabled={!remarks.trim() || isUpdating}
                  isLoading={isUpdating}
                >
                  Add Remarks
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h2 className="font-semibold text-slate-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Reject Complaint
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-slate-600">
                Are you sure you want to reject this complaint? Please provide a reason for rejection.
              </p>
              <TextArea
                label="Rejection Reason"
                placeholder="Explain why this complaint is being rejected..."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                rows={4}
                required
              />
            </CardBody>
            <CardFooter className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectRemarks('');
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleReject}
                disabled={!rejectRemarks.trim() || isUpdating}
                isLoading={isUpdating}
              >
                Reject Complaint
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};
