import api from '../utils/api';

// Base API path for user endpoints
const API_BASE = '/users';

// Debug: Log the base URL being used
console.log('API Base URL:', api.defaults.baseURL);
console.log('Full Users URL:', `${api.defaults.baseURL}${API_BASE}`);

/**
 * User API Service
 * Handles all user-related API calls
 */
const userApi = {
  // Get all users with optional filters
  getUsers: async (filters = {}) => {
    try {
      console.log('Sending request to:', API_BASE);
      const response = await api.get(API_BASE, { params: filters });
      console.log('Users response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });
      throw error;
    }
  },

  // Get single user by ID
  getById: async (userId) => {
    try {
      const response = await api.get(`${API_BASE}/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Create a new user
  create: async (userData) => {
    try {
      const response = await api.post(API_BASE, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update an existing user
  update: async (userId, userData) => {
    try {
      const response = await api.put(`${API_BASE}/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },
  
  // Update user profile (phone, address)
  updateProfile: async (profileData) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Use the correct endpoint /api/users/profile
      const response = await api.put('/users/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('Users');
        window.location.href = '/login';
      }
      throw error;
    }
  },

  // Delete a user
  delete: async (userId) => {
    try {
      await api.delete(`${API_BASE}/${userId}`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  // Change user password
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.put(
        `${API_BASE}/${userId}/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error changing password for user ${userId}:`, error);
      if (error.response?.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('Users');
        window.location.href = '/login';
      }
      throw error;
    }
  },

  // Update user status (active/inactive)
  updateStatus: async (userId, isActive) => {
    try {
      const response = await api.put(`${API_BASE}/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for user ${userId}:`, error);
      throw error;
    }
  }
};

export default userApi;

// For debugging: Log the current API configuration
export const logApiConfig = () => {
  console.log('Current API Configuration:', {
    baseURL: api.defaults.baseURL,
    withCredentials: api.defaults.withCredentials,
    headers: api.defaults.headers
  });
};

// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/users/signup');
    console.log('API test response:', response.data);
    return true;
  } catch (error) {
    console.error('API connection test failed:', {
      message: error.message,
      config: {
        url: error.config?.baseURL + error.config?.url,
        method: error.config?.method
      },
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data
    });
    return false;
  }
};

// Log the configuration and test connection when this module is imported
logApiConfig();
testApiConnection();
