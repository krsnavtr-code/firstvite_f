// LMSContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';
import {
  getMyEnrollments,
  getCourseContent,
  updateLessonProgress as updateLessonProgressApi,
  generateCertificate as generateCertificateApi
} from '../api/lmsApi';

// Create a context for LMS
const LMSContext = createContext();

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};

export const LMSProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [progress, setProgress] = useState({});
  
  // console.log('LMSProvider - User state:', { 
  //   user, 
  //   isAuthenticated,
  //   hasUser: !!user,
  //   userId: user?._id 
  // });

  // Load enrollments when user changes
  const loadEnrollments = useCallback(async () => {
    // console.group('Loading Enrollments');
    // console.log('Current auth state:', { user, isAuthenticated });
    
    const token = localStorage.getItem('token');
    if ((!user && !token) || !isAuthenticated) {
      // console.log('No authenticated user or token, skipping enrollments load');
      setLoading(false);
      setEnrollments([]);
      // console.groupEnd();
      return;
    }
    
    // If we have a token but no user, try to get the user from localStorage
    let currentUser = user;
    if (!currentUser && token) {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          currentUser = JSON.parse(userData);
          console.log('Retrieved user from localStorage:', currentUser);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    const userId = currentUser?._id || user?._id;
    if (!userId) {
      console.error('No user ID available for fetching enrollments');
      setLoading(false);
      setEnrollments([]);
      console.groupEnd();
      return;
    }

    console.log('Loading enrollments for user:', userId);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching enrollments...');
      // Ensure token is set in headers
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await getMyEnrollments();
      console.log('Enrollments API response:', response);
      
      // Process the response based on its format
      let enrollmentsData = [];
      
      if (Array.isArray(response)) {
        enrollmentsData = response;
      } else if (response?.data) {
        enrollmentsData = Array.isArray(response.data) ? response.data : [];
      }
      
      // Filter out guest enrollments and ensure the course exists
      enrollmentsData = enrollmentsData.filter(enrollment => {
        const isValid = enrollment.user && 
                       enrollment.course && 
                       !enrollment.isGuestEnrollment;
        
        if (!isValid) {
          console.log('Filtering out invalid enrollment:', {
            id: enrollment._id,
            hasUser: !!enrollment.user,
            hasCourse: !!enrollment.course,
            isGuest: enrollment.isGuestEnrollment
          });
        }
        
        return isValid;
      });
      
      console.log('Filtered enrollments:', enrollmentsData);
      
      console.log(`Found ${enrollmentsData.length} enrollments`);
      
      // Process each enrollment to ensure consistent structure
      const processedEnrollments = enrollmentsData.map(enrollment => {
        // Handle case where course might be a string ID or an object
        const course = typeof enrollment.course === 'string' 
          ? { _id: enrollment.course }
          : enrollment.course || {};
          
        return {
          ...enrollment,
          course: {
            _id: course._id || enrollment.courseId || 'unknown-course',
            title: course.title || 'Untitled Course',
            description: course.description || '',
            image: course.image || null,
            ...course
          },
          progress: Math.min(100, Math.max(0, Number(enrollment.progress) || 0)),
          completionStatus: enrollment.completionStatus || 'in_progress'
        };
      });
      
      console.log('Processed enrollments:', processedEnrollments);
      setEnrollments(processedEnrollments);
      
    } catch (err) {
      console.error('Error loading enrollments:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [user, isAuthenticated]);
  
  // Load enrollments when user changes
  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

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


