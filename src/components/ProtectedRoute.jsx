import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, isPublicOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-10 text-center font-bold">Verifying Session...</div>;
  }

  // Public Only page 
  if (isPublicOnly && user) {
    return user.is_admin 
      ? <Navigate to="/welcome-admin" replace /> 
      : <Navigate to="/welcome-patient" replace />;
  }

  // user is not logged in
  if (!isPublicOnly && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Patient trying to access Admin page
  if (adminOnly && !user?.is_admin) {
    console.warn("Unauthorized access attempt to Admin page");
    return <Navigate to="/welcome-patient" replace />;
  }

  //  Admin trying to access Patient page
  if (!adminOnly && !isPublicOnly && user?.is_admin) {
     return <Navigate to="/welcome-admin" replace />;
  }

  return children;
};

export default ProtectedRoute;