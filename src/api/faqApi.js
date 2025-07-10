import api from './axios';

// No need for API_PREFIX as it's already included in the baseURL

// Helper function to handle API errors
const handleApiError = (error, context) => {
  console.error(`Error ${context}:`, error);
  
  // Extract error message from response if available
  const errorMessage = error.response?.data?.message || 
                      error.message || 
                      `An error occurred while ${context}`;
  
  // Show toast notification
  if (typeof window !== 'undefined') {
    import('react-hot-toast').then(({ toast }) => {
      toast.error(errorMessage);
    });
  }
  
  throw new Error(errorMessage);
};

// Get all FAQs (public)
export const getFAQs = async (params = {}) => {
  try {
    const defaultParams = {
      status: 'active',
      sort: 'order',
      order: 'asc',
      limit: 50
    };
    
    console.log('Fetching FAQs with params:', { ...defaultParams, ...params });
    const response = await api.get('', { 
      params: { ...defaultParams, ...params } 
    });
    
    console.log('FAQ API Response:', response.data);
    
    // Handle both response formats for backward compatibility
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data.docs)) {
      return response.data.docs;
    }
    
    console.warn('Unexpected FAQ response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error in getFAQs:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return handleApiError(error, 'fetching FAQs');
  }
};

// Admin functions
const withAdminAuth = (config = {}) => ({
  ...config,
  headers: {
    ...config.headers,
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

// Get all FAQs (admin)
export const getAllFAQs = async () => {
  try {
    const response = await api.get('/admin/faqs', withAdminAuth());
    // Handle both direct array response and paginated response
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.docs)) {
      return response.data.docs; // Handle paginated response
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data; // Handle nested data array
    }
    return [];
  } catch (error) {
    console.error('Error in getAllFAQs:', error);
    return handleApiError(error, 'fetching all FAQs');
  }
};

// Get single FAQ
export const getFAQ = async (id) => {
  try {
    const response = await api.get(`/admin/faqs/${id}`, withAdminAuth());
    return response.data?.data || null;
  } catch (error) {
    return handleApiError(error, `fetching FAQ ${id}`);
  }
};

// Create FAQ
export const createFAQ = async (faqData) => {
  try {
    const response = await api.post(
      '/admin/faqs', 
      faqData, 
      withAdminAuth()
    );
    return response.data?.data || null;
  } catch (error) {
    return handleApiError(error, 'creating FAQ');
  }
};

// Update FAQ
export const updateFAQ = async (id, faqData) => {
  try {
    const response = await api.put(
      `/admin/faqs/${id}`, 
      faqData, 
      withAdminAuth()
    );
    return response.data?.data || null;
  } catch (error) {
    return handleApiError(error, `updating FAQ ${id}`);
  }
};

// Delete FAQ
export const deleteFAQ = async (id) => {
  try {
    await api.delete(`/admin/faqs/${id}`, withAdminAuth());
    return id; // Return the deleted FAQ ID
  } catch (error) {
    return handleApiError(error, `deleting FAQ ${id}`);
  }
};

// Update FAQ order
export const updateFAQOrder = async (orderedIds) => {
  try {
    const response = await api.put(
      '/admin/faqs/update-order', 
      { orderedIds },
      withAdminAuth()
    );
    return response.data?.data || null;
  } catch (error) {
    return handleApiError(error, 'updating FAQ order');
  }
};
