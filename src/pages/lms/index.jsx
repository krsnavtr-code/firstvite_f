import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import Dashboard from './Dashboard';
import CoursePlayer from './CoursePlayer';

const { Content } = Layout;

const LMS = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: '/lms' }} replace />;
  }

  return (
    <Layout className="lms-layout">
      <Content className="lms-content">
        <Routes>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="courses/:courseId" element={<CoursePlayer />} />

          {/* Any other route */}
          <Route path="*" element={<Navigate to="/lms" replace />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default LMS;
