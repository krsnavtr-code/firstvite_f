import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4002') + '/api';

export const submitContactForm = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/contacts`, formData);
    return response.data;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error.response?.data || { message: 'Failed to submit contact form' };
  }
};

export const getContacts = async (token, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/contacts`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error.response?.data || { message: 'Failed to fetch contacts' };
  }
};

export const updateContactStatus = async (id, status, token) => {
  try {
    const response = await axios.patch(
      `${API_URL}/contacts/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating contact status:', error);
    throw error.response?.data || { message: 'Failed to update contact status' };
  }
};
