import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, isPublicOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Handle Loading State
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 font-semibold text-slate-600">Verifying Session...</span>
      </div>
    );
  }

  // 2. Public Only Logic (Login/Register)
  // If user is already logged in, redirect them to their respective dashboard
  if (isPublicOnly && user) {
    return user.is_admin 
      ? <Navigate to="/welcome-admin" replace /> 
      : <Navigate to="/welcome-patient" replace />;
  }

  // 3. Authentication Check
  // If trying to access a private page while logged out
  if (!isPublicOnly && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Authorization Check (Admin Only)
  // If a non-admin tries to access an admin-only route
  if (adminOnly && !user?.is_admin) {
    console.warn("Access Denied: Admin privileges required.");
    return <Navigate to="/welcome-patient" replace />;
  }

  // FIX: We removed the "Admin trying to access Patient page" check.
  // This allows admins to view pages where adminOnly={false}, 
  // preventing the infinite redirect loop you were experiencing.

  return children;
};

export default ProtectedRoute;