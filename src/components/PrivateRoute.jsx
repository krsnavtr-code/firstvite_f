import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { message } from 'antd';

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Debug logging
  useEffect(() => {
    console.log('PrivateRoute - Auth State:', { 
      hasAuthUser: isAuthenticated,
      currentUser,
      isAdmin: currentUser?.role === 'admin',
      loading,
      allowedRoles,
      currentPath: location.pathname
    });
  }, [currentUser, isAuthenticated, loading, allowedRoles, location.pathname]);

  // Add a small delay before showing loading state to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Get user role and check if they're an admin
  const userRole = currentUser?.role?.toLowerCase();
  const isAdmin = userRole === 'admin'; // Check if user role is 'admin'

  // If we have a token, show content immediately
  if (localStorage.getItem('token')) {
    // If we don't have currentUser yet but have a token, show loading
    if (!currentUser) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
    return (
      <>
        {children ? React.cloneElement(children, { currentUser }) : <Outlet />}
      </>
    );
  }

  // If we're loading but don't have a token, show loading
  if (loading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If we're not loading but not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('PrivateRoute - Not authenticated, redirecting to login');
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check admin access first
  if (location.pathname.startsWith('/admin')) {
    if (!isAdmin) {
      console.log('PrivateRoute - Admin access denied');
      return <Navigate to="/" replace />;
    }
    return (
      <>
        {children ? React.cloneElement(children, { currentUser }) : <Outlet />}
      </>
    );
  }

  // Check allowed roles for non-admin routes
  if (allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => 
      role.toLowerCase() === userRole
    );

    if (!hasAllowedRole) {
      console.log('PrivateRoute - Role-based access denied', {
        currentRole: userRole,
        allowedRoles,
        hasToken: !!localStorage.getItem('token')
      });
      return <Navigate to="/" replace />;
    }
  }

  // If we've passed all checks, show the content
  return (
    <>
      {children ? React.cloneElement(children, { currentUser }) : <Outlet />}
    </>
  );
}
