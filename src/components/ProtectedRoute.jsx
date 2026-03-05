import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-10 text-center font-bold">Verifying Session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.is_admin) {
    console.warn("Unauthorized access attempt to Admin page");
    return <Navigate to="/welcome-patient" replace />;
  }

  if (!adminOnly && user.is_admin) {
     return <Navigate to="/welcome-admin" replace />;
  }

  return children;
};

export default ProtectedRoute;