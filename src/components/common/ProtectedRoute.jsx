import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { authUser } = useAuth();
  const location = useLocation();

  // If user is not logged in
  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required but user doesn't have it
  if (roles.length > 0 && !roles.includes(authUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
