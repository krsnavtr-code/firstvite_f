import axios from './axios';

// Email Records

export const getEmailRecords = async (filters = {}) => {
  try {
    const response = await axios.get('/emails', { 
      params: { 
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 10
      } 
    });
    return response.data; // The backend returns { data: { records, total, ... } }
  } catch (error) {
    console.error('Error fetching email records:', error);
    throw error;
  }
};

// Get all pending enrollments
export const getPendingEnrollments = async () => {
  try {
    const response = await axios.get('/enrollments/pending');
    // Return the data with the expected structure { enrollments: [...] }
    return { data: { enrollments: response.data.enrollments || [] } };
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

// Get all enrollments with complete user details (Admin only)
export const getAllEnrollments = async (filters = {}) => {
  try {
    const response = await axios.get('/enrollments/all', {
      params: {
        ...filters,
        language: localStorage.getItem('i18nextLng') || 'en'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all enrollments:', error);
    throw error;
  }
};

// Get enrollments with filters (for admin dashboard)
export const getEnrollments = async (filters = {}) => {
  try {
    const response = await axios.get('/enrollments', {
      params: {
        ...filters,
        language: localStorage.getItem('i18nextLng') || 'en'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
};
