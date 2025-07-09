import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base URL and headers
console.log("axios baseURL:", import.meta.env.VITE_API_BASE_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Full backend URL with /api
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Skip for login/register routes
    if (config.url.includes('/login') || config.url.includes('/register')) {
      return config;
    }
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    // console.log('Token from localStorage:', token ? 'Found' : 'Not found');
    
    if (token) {
      // Set both Authorization and x-auth-token headers for backward compatibility
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
      // console.log('Auth headers set with token');
    } else {
      console.warn('No token found in localStorage');
      // If you want to redirect to login when no token is found, uncomment below
      // window.location.href = '/login';
      // return Promise.reject('No token found');
    }
    
    // console.log('Making request to:', config.method?.toUpperCase(), config.url);
    // console.log('Request headers:', JSON.stringify(config.headers, null, 2));
    
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
      
      // Only handle 401 if not on a public route
      const isPublicRoute = ['/login', '/signup', '/', '/about', '/contact'].some(route => 
        window.location.pathname.startsWith(route)
      );
      
      if (status === 401) {
        // Only handle unauthorized for non-public routes
        if (!isPublicRoute) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
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
      } else if (status !== 401) { // Don't show generic error for 401
        // Generic error message
        toast.error('An error occurred. Please try again.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      toast.error('Unable to connect to the server. Please check your internet connection.');
    } else if (!error.response || error.response.status !== 401) { // Don't log 401 errors
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
      toast.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
