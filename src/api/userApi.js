import api from '../utils/api';

// Base API path for user endpoints
// Using just '/users' because the baseURL already includes '/api'
const API_BASE = '/users';

// Mock data for development
const mockUsers = [
  {
    _id: '1',
    fullname: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    fullname: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Get all users
export const getUsers = async () => {
  try {
    console.log('Fetching users from:', API_BASE);
    // Uncomment this line to use real API when available
    // const response = await api.get(API_BASE);
    // return response.data;
    
    // Using mock data for now
    console.log('Using mock data for users');
    return [...mockUsers];
  } catch (error) {
    console.error('Error fetching users:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.baseURL + error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });
    
    // Return mock data even if there's an error for development
    console.log('Falling back to mock data due to error');
    return [...mockUsers];
  }
};

// Get single user by ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`${API_BASE}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const response = await api.post(API_BASE, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`${API_BASE}/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    await api.delete(`${API_BASE}/${userId}`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

// Change user password
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await api.put(`${API_BASE}/${userId}/change-password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error(`Error changing password for user ${userId}:`, error);
    throw error;
  }
};

// Update user status (active/inactive)
export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await api.put(`${API_BASE}/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for user ${userId}:`, error);
    throw error;
  }
};

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
    const response = await api.get('/');
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
