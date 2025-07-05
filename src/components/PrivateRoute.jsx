import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function PrivateRoute({ children, roles = [] }) {
  const { authUser } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!authUser) {
    // Redirect to login page with the return URL
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(authUser.role)) {
    // Redirect to unauthorized page or home
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // User is authenticated and has required role
  return children;
}
