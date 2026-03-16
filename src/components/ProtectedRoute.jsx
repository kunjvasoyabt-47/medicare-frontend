import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
  import SystemLoader from "./SystemLoader";

const ProtectedRoute = ({
  children,
  adminOnly = false,
  isPublicOnly = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SystemLoader fullScreen label="Verifying Session" />;
  }

  // Public Only page
  if (isPublicOnly && user) {
    return user.is_admin ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/patient/dashboard" replace />
    );
  }

  // user is not logged in
  if (!isPublicOnly && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Patient trying to access Admin page
  if (adminOnly && !user?.is_admin) {
    console.warn("Unauthorized access attempt to Admin page");
    return <Navigate to="/patient/dashboard" replace />;
  }

  //  Admin trying to access Patient page
  if (!adminOnly && !isPublicOnly && user?.is_admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
