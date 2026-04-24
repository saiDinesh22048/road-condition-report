import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Camera, Upload, X, CheckCircle, ArrowLeft } from 'lucide-react';
import { complaintApi } from '../../services/api';
import { ComplaintFormData, ISSUE_CATEGORIES, CATEGORY_LABELS } from '../../types';
import { Button, Input, Select, TextArea, Card, CardBody, LoadingOverlay } from '../../components/ui';

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ComplaintFormData>({
    category: '',
    title: '',
    description: '',
    address: '',
    images: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ComplaintFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ complaintId: string; submittedAt: string } | null>(null);

  const categoryOptions = ISSUE_CATEGORIES.map((cat) => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ComplaintFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPEG, PNG, WebP, and GIF are allowed.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length + formData.images.length > 5) {
      toast.error('Maximum 5 images allowed');
      validFiles.splice(5 - formData.images.length);
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));

    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ComplaintFormData, string>> = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a more detailed address';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('category', formData.category);
      if (formData.title?.trim()) {
        submitData.append('title', formData.title.trim());
      }
      submitData.append('description', formData.description.trim());
      submitData.append('address', formData.address.trim());
      formData.images.forEach((image) => {
        submitData.append('images', image);
      });

      const response = await complaintApi.create(submitData);
      
      if (response.success && response.data) {
        setSubmitSuccess({
          complaintId: response.data.complaintId,
          submittedAt: response.data.submittedAt,
        });
        toast.success('Complaint submitted successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit complaint';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardBody className="py-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Complaint Submitted Successfully!
            </h2>
            <p className="text-slate-600 mb-6">
              Your road condition report has been received and will be reviewed shortly.
            </p>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-slate-500 mb-1">Complaint ID</div>
              <div className="text-xl font-mono font-bold text-primary-600">
                {submitSuccess.complaintId}
              </div>
              <div className="text-sm text-slate-500 mt-2">
                Submitted on{' '}
                {new Date(submitSuccess.submittedAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              Keep this ID for future reference. You can track your complaint status from your dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSubmitSuccess(null);
                  setFormData({
                    category: '',
                    title: '',
                    description: '',
                    address: '',
                    images: [],
                  });
                }}
              >
                Report Another Issue
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {isSubmitting && <LoadingOverlay message="Submitting your complaint..." />}
      
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Report a Road Issue</h1>
        <p className="text-slate-600 mt-1">
          Fill in the details below to submit your road condition report
        </p>
      </div>

      <Card>
        <CardBody className="py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <Select
              label="Issue Category"
              name="category"
              options={categoryOptions}
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              placeholder="Select a category"
              required
            />

            {/* Title (Optional) */}
            <Input
              label="Issue Title"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="Brief title for the issue (optional)"
              helperText="Optional: Provide a short title to identify the issue"
            />

            {/* Description */}
            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Describe the road condition issue in detail..."
              helperText="Minimum 10 characters. Include details like severity and impact."
              rows={4}
              required
            />

            {/* Address */}
            <TextArea
              label="Location / Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Enter the exact location or address of the issue..."
              helperText="Be as specific as possible. Include landmarks, street names, and nearby locations."
              rows={3}
              required
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Photos <span className="text-red-500">*</span>
              </label>
              
              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Buttons */}
              {formData.images.length < 5 && (
                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              )}

              {errors.images && (
                <p className="text-sm text-red-600">{errors.images}</p>
              )}
              <p className="text-sm text-slate-500">
                Upload 1-5 images. Max 5MB each. JPEG, PNG, WebP, or GIF.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isSubmitting}
              >
                Submit Report
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
