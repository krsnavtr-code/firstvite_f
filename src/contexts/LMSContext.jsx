import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getMyEnrollments,
  getCourseContent,
  updateLessonProgress as updateLessonProgressApi,
  generateCertificate as generateCertificateApi
} from '../api/lmsApi';

const LMSContext = createContext();

export const LMSProvider = ({ children }) => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [progress, setProgress] = useState({});

  // Load user's enrollments
  const loadEnrollments = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMyEnrollments();
      // The response should be an array of enrollments
      const enrollmentsData = Array.isArray(response) ? response : (response.data || []);
      console.log('Fetched enrollments:', enrollmentsData);
      setEnrollments(enrollmentsData);
    } catch (err) {
      console.error('Error loading enrollments:', err);
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Load course content
  const loadCourseContent = async (courseId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCourseContent(courseId);
      setCurrentCourse(data);
      return data;
    } catch (err) {
      console.error('Error loading course content:', err);
      setError(err.message || 'Failed to load course content');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update lesson progress
  const updateLessonProgress = async (courseId, lessonId) => {
    try {
      const data = await updateLessonProgressApi(courseId, lessonId);
      
      // Update local state
      setCurrentCourse(prev => ({
        ...prev,
        enrollment: {
          ...prev.enrollment,
          progress: data.progress,
          completionStatus: data.completionStatus,
          completedLessons: [
            ...new Set([...prev.enrollment.completedLessons, lessonId])
          ]
        }
      }));
      
      // Update enrollments list
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.course._id === courseId
            ? { 
                ...enrollment, 
                progress: data.progress,
                completionStatus: data.completionStatus 
              }
            : enrollment
        )
      );
      
      return data;
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  };

  // Generate certificate
  const generateCertificate = async (courseId) => {
    try {
      const data = await generateCertificateApi(courseId);
      
      // Update local state
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.course._id === courseId
            ? { 
                ...enrollment, 
                certificateIssued: true,
                certificateId: data.certificateId,
                certificateIssuedAt: data.issuedAt
              }
            : enrollment
        )
      );
      
      return data;
    } catch (err) {
      console.error('Error generating certificate:', err);
      throw err;
    }
  };

  // Load enrollments when user changes
  useEffect(() => {
    if (user) {
      loadEnrollments();
    } else {
      setEnrollments([]);
      setCurrentCourse(null);
    }
  }, [user]);

  const value = {
    enrollments,
    currentCourse,
    loading,
    error,
    loadEnrollments,
    loadCourseContent,
    updateLessonProgress,
    generateCertificate,
    isEnrolled: (courseId) => 
      enrollments.some(e => e.course._id === courseId || e.course === courseId)
  };

  return <LMSContext.Provider value={value}>{children}</LMSContext.Provider>;
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};
