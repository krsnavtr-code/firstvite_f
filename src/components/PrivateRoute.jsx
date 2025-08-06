import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export default function PrivateRoute({ 
  children, 
  allowedRoles = [],
  requireLMS = false
}) {
  const { currentUser, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const userRole = currentUser?.role?.toLowerCase();
  
  // Define admin roles with hierarchy
  const isSuperChildAdmin = userRole === 'superchildadmin';
  const isAdmin = userRole === 'admin' || isSuperChildAdmin;
  const isChildAdmin = userRole === 'childadmin' || isAdmin;

  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is active
  if (currentUser?.isActive === false) {
    logout();
    return <Navigate to="/login?error=account_suspended" replace />;
  }

  // Check LMS access requirements
  if (requireLMS && currentUser?.isApproved === false) {
    logout();
    return <Navigate to="/login?error=not_approved" replace />;
  }

  // Check admin access with role hierarchy
  if (location.pathname.startsWith('/admin')) {
    // If no specific roles required, allow all admin roles
    if (allowedRoles.length === 0) {
      if (!isChildAdmin) {
        console.log('Access denied: User does not have admin privileges');
        return <Navigate to="/unauthorized" replace />;
      }
    } 
    // If specific roles are required, check if user has any of them
    else if (allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.some(role => {
        const normalizedRole = role?.toLowerCase();
        if (normalizedRole === 'superchildadmin') return isSuperChildAdmin;
        if (normalizedRole === 'admin') return isAdmin;
        if (normalizedRole === 'childadmin') return isChildAdmin;
        return false;
      });
      
      if (!hasRequiredRole) {
        console.log(`Access denied: User role '${userRole}' is not in allowed roles:`, allowedRoles);
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // Check allowed roles for non-admin routes
  if (allowedRoles.length > 0 && !location.pathname.startsWith('/admin')) {
    const normalizedUserRole = userRole?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role?.toLowerCase());
    
    const hasRequiredRole = normalizedAllowedRoles.some(role => {
      if (role === 'superchildadmin') return isSuperChildAdmin;
      if (role === 'admin') return isAdmin;
      if (role === 'childadmin') return isChildAdmin;
      return normalizedUserRole === role;
    });
    
    if (!hasRequiredRole) {
      console.log(`Access denied: User role '${userRole}' is not in allowed roles:`, allowedRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If we get here, user is authenticated and has the required role/status
  console.log('PrivateRoute - Access granted', {
    path: location.pathname,
    userRole,
    isAuthenticated,
    requireLMS,
    isApproved: currentUser?.isApproved,
    isActive: currentUser?.isActive
  });
  
  return (
    <>
      {children ? React.cloneElement(children, { currentUser }) : <Outlet />}
    </>
  );
}
