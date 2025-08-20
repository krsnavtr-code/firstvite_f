import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LMSLayout from '../../components/lms/LMSLayout';

const LMS = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: '/lms' }} replace />;
  }

  return (
    <LMSLayout>
      <Outlet />
    </LMSLayout>
  );
};

export default LMS;
