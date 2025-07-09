import axios from './axios';

// Enroll in a course
export const enrollInCourse = async (courseId) => {
  try {
    const response = await axios.post('/enrollments', { courseId });
    return response.data;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

// Get user's enrollments
export const getUserEnrollments = async (userId) => {
  try {
    console.log('Fetching enrollments for user:', userId);
    const token = localStorage.getItem('token');
    console.log('Current token:', token ? 'Token exists' : 'No token found');
    
    const response = await axios.get(`/enrollments/me`, {
      params: { userId },
      headers: {
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Enrollments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollments:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('Users');
      window.location.href = '/login';
    }
    
    throw error;
  }
};

// Update enrollment status (admin only)
export const updateEnrollmentStatus = async (enrollmentId, status) => {
  try {
    const response = await axios.put(`/enrollments/${enrollmentId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    throw error;
  }
};
