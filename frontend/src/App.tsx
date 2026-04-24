import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LoadingPage } from './components/ui';
import { UserLayout, AdminLayout, ProtectedRoute } from './components/layout';

// Auth Pages
import {
  LoginPage,
  RegisterPage,
  AdminLoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/auth';

// User Pages
import {
  UserDashboard,
  ReportIssuePage,
  ComplaintDetailPage,
} from './pages/user';

// Admin Pages
import {
  AdminDashboard,
  AdminComplaintsPage,
  AdminComplaintDetailPage,
} from './pages/admin';

const App: React.FC = () => {
  const { checkAuth, isLoading, isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingPage message="Loading application..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />
          ) : (
            <RegisterPage />
          )
        }
      />
      <Route
        path="/admin/login"
        element={
          isAuthenticated && isAdmin ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <AdminLoginPage />
          )
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* User Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/report" element={<ReportIssuePage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<AdminComplaintsPage />} />
        <Route path="complaints/:id" element={<AdminComplaintDetailPage />} />
      </Route>

      {/* Default Redirects */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
