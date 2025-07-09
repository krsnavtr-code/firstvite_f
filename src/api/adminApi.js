import axios from './axios';

// Get all pending enrollments
export const getPendingEnrollments = async () => {
  try {
    const response = await axios.get('/enrollments/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending enrollments:', error);
    throw error;
  }
};

// Update enrollment status
export const updateEnrollmentStatus = async (enrollmentId, status) => {
  try {
    const response = await axios.put(`/enrollments/${enrollmentId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    throw error;
  }
};

// Get all enrollments (for admin dashboard)
export const getAllEnrollments = async (filters = {}) => {
  try {
    const response = await axios.get('/enrollments', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching all enrollments:', error);
    throw error;
  }
};
