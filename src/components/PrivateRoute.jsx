import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function PrivateRoute({ children, roles = [] }) {
  const { authUser, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Debug logging
  useEffect(() => {
    console.log('PrivateRoute - Auth State:', { 
      hasAuthUser: !!authUser,
      authUser,
      isAdmin,
      loading,
      requiredRoles: roles,
      currentPath: location.pathname
    });
  }, [authUser, isAdmin, loading, roles, location.pathname]);

  // Add a small delay before showing loading state to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking auth
  if (loading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Only check authentication once loading is complete
  if (!loading && !isCheckingAuth && !authUser) {
    console.log('PrivateRoute - No authenticated user, redirecting to login');
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if route requires specific roles
  if (roles.length > 0) {
    const hasRequiredRole = roles.includes(authUser.role) || (roles.includes('admin') && isAdmin);
    
    if (!hasRequiredRole) {
      console.log('PrivateRoute - Access Denied - Missing required role', {
        userRole: authUser.role,
        isAdmin,
        requiredRoles: roles,
        currentPath: location.pathname
      });
      
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // Special handling for admin routes - only check if user is admin when accessing admin routes
  if (location.pathname.startsWith('/admin')) {
    if (authUser.role !== 'admin') {
      console.log('PrivateRoute - Admin access required:', {
        userRole: authUser.role,
        isAdmin,
        path: location.pathname
      });
      
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  console.log('PrivateRoute - Access granted to:', {
    path: location.pathname,
    userRole: authUser.role,
    isAdmin
  });

  // User is authenticated and has required role
  return children;
}
