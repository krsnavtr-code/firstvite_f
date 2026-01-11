import axios from "axios";

const API_URL = "/api/test-questions";

// Add auth header for protected routes
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTestQuestions = async () => {
    const response = await axios.get(`${API_URL}/questions`, { 
      headers: getAuthHeader() 
    });
    return response.data;
};

export const submitTestAnswers = async (answers) => {
    const response = await axios.post(
        `${API_URL}/submit`,
        { answers },
        { headers: getAuthHeader() }
    );
    return response.data;
};