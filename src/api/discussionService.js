import api from './axios';

const API_URL = '/discussions';

// Create new discussion
export const createDiscussion = async (discussionData) => {
  try {
    const response = await api.post(API_URL, discussionData);
    return response.data;
  } catch (error) {
    console.error('Error in createDiscussion:', error);
    throw error;
  }
};

// Get all discussions
export const getDiscussions = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    console.log('Fetching discussions with filters:', filters);
    const response = await api.get(`${API_URL}?${params}`);
    
    // Log complete response structure for debugging
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    
    // Check if response.data exists
    if (!response.data) {
      console.warn('No data in response, returning empty array');
      return [];
    }
    
    // The backend returns discussions in response.data.data
    if (response.data.data && Array.isArray(response.data.data)) {
      console.log(`Returning ${response.data.data.length} discussions from response.data.data`);
      return response.data.data;
    }
    
    // Fallback to direct array if data is an array
    if (Array.isArray(response.data)) {
      console.log(`Returning ${response.data.length} discussions from direct array`);
      return response.data;
    }
    
    console.warn('Unexpected response format, returning empty array. Response data:', response.data);
    return [];
  } catch (error) {
    console.error('Error in getDiscussions:', error);
    return [];
  }
};

// Get single discussion
export const getDiscussion = async (discussionId) => {
  const response = await api.get(`${API_URL}/${discussionId}`);
  return response.data;
};

// Update discussion
export const updateDiscussion = async (discussionId, updateData) => {
  const response = await api.put(`${API_URL}/${discussionId}`, updateData);
  return response.data;
};

// Delete discussion
export const deleteDiscussion = async (discussionId) => {
  const response = await api.delete(`${API_URL}/${discussionId}`);
  return response.data;
};

// Add comment to discussion
export const addComment = async (discussionId, commentData) => {
  const response = await api.post(
    `${API_URL}/${discussionId}/comments`,
    commentData
  );
  return response.data;
};

// Toggle like/dislike
export const toggleReaction = async (discussionId, reaction, commentId = null) => {
  const response = await api.put(
    `${API_URL}/${discussionId}/reaction`,
    { reaction, commentId }
  );
  return response.data;
};
