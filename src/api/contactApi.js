// contactApi.js - API functions for contact-related operations
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4002/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
  withCredentials: true, // Important for cookies/sessions
});

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details in development
    if (import.meta.env.DEV) {
      console.log(`[${config.method?.toUpperCase()}] ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`[${response.status}] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    const errorResponse = {
      config: error.config,
      status: error.response?.status,
      data: error.response?.data,
    };

    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: import.meta.env.DEV ? error.stack : undefined,
    });

    // Handle specific error statuses
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const { status, data } = error.response;
      
      // Handle common error statuses
      if (status === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      } else if (status === 403) {
        // Forbidden - show access denied
        errorResponse.message = data.message || 'You do not have permission to perform this action.';
      } else if (status === 404) {
        // Not found
        errorResponse.message = data.message || 'The requested resource was not found.';
      } else if (status === 422) {
        // Validation error
        errorResponse.message = data.message || 'Validation failed.';
        errorResponse.errors = data.errors || {};
      } else if (status >= 500) {
        // Server error
        errorResponse.message = data.message || 'A server error occurred. Please try again later.';
      }
    } else if (error.request) {
      // No response received
      errorResponse.message = 'No response from server. Please check your connection and try again.';
    } else {
      // Request setup error
      errorResponse.message = error.message || 'An error occurred while processing your request.';
    }

    return Promise.reject(errorResponse);
  }
);

/**
 * Submit a contact form with comprehensive error handling
 * @param {Object} formData - The contact form data
 * @param {string} formData.name - User's name (required)
 * @param {string} formData.email - User's email (required)
 * @param {string} [formData.phone] - User's phone number (optional)
 * @param {string} formData.message - The message (required, 10-2000 chars)
 * @param {string} [formData.courseId] - Optional course ID
 * @param {string} [formData.courseTitle] - Optional course title
 * @param {string} [formData.subject] - Optional subject (max 200 chars)
 * @returns {Promise<{success: boolean, data?: Object, message: string, errors?: Object}>} The API response
 */
const submitContactForm = async (formData) => {
  try {
    // Client-side validation
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\d\s\-+()]*$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.message?.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 2000) {
      errors.message = 'Message cannot exceed 2000 characters';
    }
    
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Validation failed',
        errors,
      };
    }
    
    // Prepare request data according to backend validation rules
    const requestData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      message: formData.message.trim(),
      ...(formData.phone && formData.phone.trim() !== '' && { phone: formData.phone.trim() }),
      ...(formData.courseId && { courseId: formData.courseId }),
      ...(formData.courseTitle && formData.courseTitle.trim() !== '' && { 
        courseTitle: formData.courseTitle.trim() 
      }),
      ...(formData.subject && formData.subject.trim() !== '' && { 
        subject: formData.subject.trim() 
      }),
    };

    console.log('Submitting contact form with data:', requestData);

    // Add retry logic for rate limiting
    const maxRetries = 2;
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add a small delay between retries
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        // Make the API call with the correct endpoint
        const response = await api.post('/api/contact', requestData);
        
        console.log('Contact form submission successful:', response.data);
        
        // Use the server's response directly
        return {
          success: response.data?.success || true,
          data: response.data?.data || response.data,
          message: response.data?.message || 'Your message has been sent successfully!'
        };
        
      } catch (error) {
        lastError = error;
        
        // Log the error for debugging
        console.error(`API Error (attempt ${attempt + 1}/${maxRetries + 1}):`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          code: error.code
        });
        
        // If it's a rate limit error and we have retries left, continue the loop
        if (error.response?.status === 429 && attempt < maxRetries) {
          console.log(`Rate limited, retrying in ${attempt + 1} second(s)...`);
          continue;
        }
        
        // For all other errors, break out of the retry loop
        break;
      }
    }
    
    // If we get here, all retries failed or it's a non-retryable error
    if (lastError.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (!lastError.response) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    } else {
      // For other HTTP errors, use the server's error message if available
      const errorMessage = lastError.response?.data?.message || 
                         lastError.message || 
                         'An error occurred while submitting the form. Please try again.';
      throw new Error(errorMessage);
    }
    
  } catch (error) {
    console.error('Error in submitContactForm:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Handle validation errors
    if (error.response?.status === 422 && error.response?.data?.errors) {
      // Format validation errors into a single message
      const errorMessages = Object.values(error.response.data.errors).join(' ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    
    // Handle other types of errors
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw new Error(error.message || 'Failed to submit the contact form. Please try again later.');
  }
};

/**
 * Update contact status (admin only)
 * @param {string} id - Contact ID
 * @param {string} status - New status
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated contact data
 */
const updateContactStatus = async (id, status, token) => {
  try {
    const response = await api.patch(
      `/contacts/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return {
      success: true,
      data: response.data,
      message: 'Contact status updated successfully'
    };
    
  } catch (error) {
    console.error('Error updating contact status:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw new Error('Failed to update contact status. Please try again later.');
  }
};

/**
 * Fetch contacts with optional pagination and filtering
 * @param {Object} [options] - Query options
 * @param {string} [options.status] - Filter by status (e.g., 'new', 'contacted')
 * @param {string} [options.search] - Search term for name, email, or message
 * @param {string} [options.sort] - Sort field and direction (e.g., 'submittedAt:desc')
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=10] - Number of items per page
 * @returns {Promise<{success: boolean, data: Array, meta: Object, message?: string, error?: Object}>}
 */
const getContacts = async (options = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        message: 'Authentication required. Please log in again.',
        shouldLogout: true,
        data: [],
        meta: {}
      };
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.search) params.append('search', options.search);
    if (options.sort) params.append('sort', options.sort);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await api.get(`/contacts?${params.toString()}`);
    
    return {
      success: true,
      data: response.data.data || [],
      meta: response.data.meta || {},
      message: response.data.message
    };
    
  } catch (error) {
    console.error('Error fetching contacts:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Your session has expired. Please log in again.',
        shouldLogout: true,
        data: [],
        meta: {}
      };
    }

    // Return a structured error response
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch contacts. Please try again later.',
      error: error.response?.data || { message: error.message },
      data: [],
      meta: {}
    };
  }
};

export { submitContactForm, updateContactStatus, getContacts };
