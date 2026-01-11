import axios from "axios";

// Use the base URL from environment or fallback to empty string
const API_URL = "/api/test-questions";

// Create an axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      // You might want to redirect to login here or handle the missing token
      return Promise.reject(new Error('Authentication required'));
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      console.error('Authentication error:', error.response?.data?.message || 'Unauthorized');
      // Optionally clear the invalid token
      localStorage.removeItem('token');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export const getTestQuestions = async () => {
  try {
    const response = await api.get('/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching test questions:', error);
    throw error;
  }
};

export const submitTestAnswers = async (answers, questionIds) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing. Please log in again.');
    }

    const response = await api.post('/submit', {
      answers,
      questionIds
    }, {
      validateStatus: (status) => status < 500 // Resolve only if the status code is less than 500
    });

    if (response.status === 401) {
      // Clear the invalid token
      localStorage.removeItem('token');
      throw new Error('Your session has expired. Please log in again.');
    }

    if (response.status !== 200) {
      throw new Error(response.data?.message || 'Failed to submit test answers');
    }

    return response.data;
  } catch (error) {
    console.error('Error submitting test answers:', error);
    throw error.response?.data?.message || error.message || 'Failed to submit test answers';
  }
};