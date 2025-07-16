import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base URL and headers
console.log("axios baseURL:", import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Skip adding auth header for public endpoints
    const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token'];
    
    // Don't modify the config for public endpoints
    if (publicEndpoints.some(endpoint => config.url.endsWith(endpoint))) {
      console.log('Skipping auth for public endpoint:', config.url);
      return config;
    }
    
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No token found for request:', config.url);
      return config;
    }
    
    // Ensure headers exist
    config.headers = config.headers || {};
    
    // Remove any existing Authorization header to prevent duplicates
    if (config.headers.Authorization) {
      console.log('Removing existing Authorization header');
      delete config.headers.Authorization;
    }
    
    // Trim and validate the token
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      console.error('Empty token found in localStorage');
      return config;
    }
    
    // Try to decode the token to check its format
    try {
      const tokenParts = trimmedToken.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format: expected 3 parts, got', tokenParts.length);
      } else {
        const header = JSON.parse(atob(tokenParts[0]));
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token header:', header);
        console.log('Token payload:', {
          ...payload,
          iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null
        });
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
    
    // Add the token with Bearer prefix
    config.headers.Authorization = `Bearer ${trimmedToken}`;
    console.log('Added Authorization header to request:', config.url);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log the error for debugging
    if (error.response) {
      console.error('Response error:', {
        url: originalRequest?.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else {
      console.error('Request error:', error);
    }
    
    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // If this is a refresh token request or login/register, don't try to refresh again
      if (originalRequest.url.includes('/auth/refresh-token') || 
          originalRequest.url.includes('/auth/login') || 
          originalRequest.url.includes('/auth/register')) {
        console.log('Auth endpoint detected, not attempting refresh');
        // Clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
      
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      try {
        console.log('Attempting to refresh token...');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.error('No refresh token available');
          throw new Error('No refresh token available');
        }
        
        console.log('Current refresh token:', refreshToken.substring(0, 20) + '...');
        
        // Request new access token using refresh token
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api'}/auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        
        console.log('Refresh token response:', {
          status: response.status,
          hasToken: !!(response.data && response.data.token),
          hasRefreshToken: !!(response.data && response.data.refreshToken)
        });
        
        if (!response.data || !response.data.token) {
          throw new Error('No token received in refresh response');
        }
        
        const { token: newToken, refreshToken: newRefreshToken, user } = response.data;
        
        // Store the new tokens
        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        console.log('New token stored, updating request headers');
        
        // Update the Authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Update the original request with the new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        console.log('Retrying original request:', originalRequest.url);
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject({
          ...refreshError,
          message: 'Session expired. Please log in again.',
          isAuthError: true
        });
      }
    }
    
    // Handle other error statuses
    if (error.response) {
      const { status, data } = error.response;
      const isPublicRoute = ['/login', '/signup', '/', '/about', '/contact'].some(route => 
        window.location.pathname.startsWith(route)
      );
      
      if (status === 401 && !isPublicRoute) {
        // Don't show toast here as it might be a background request
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
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
      } else if (data && data.message) {
        // Show server error message if available
        toast.error(data.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      if (!window.navigator.onLine) {
        toast.error('You are offline. Please check your internet connection.');
      } else {
        toast.error('Unable to connect to the server. Please try again later.');
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
      toast.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// Export the api instance as both default and named export
export default api;
export { api };
