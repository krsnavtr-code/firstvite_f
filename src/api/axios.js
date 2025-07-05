import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base URL and headers
const api = axios.create({
  baseURL: '/api', // Base URL will be prefixed by the proxy in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Request config:', config);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        // Handle unauthorized access
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        // Handle forbidden access
        toast.error('You do not have permission to perform this action.');
      } else if (status === 404) {
        // Handle not found
        toast.error('The requested resource was not found.');
      } else if (status === 500) {
        // Handle server error
        toast.error('An unexpected error occurred. Please try again later.');
      } else if (data?.message) {
        // Show server error message if available
        toast.error(data.message);
      } else {
        // Generic error message
        toast.error('An error occurred. Please try again.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      toast.error('Unable to connect to the server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
      toast.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
