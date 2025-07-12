import api from './axios';

// Get all categories for user panel
export const getCategoriesForUser = async () => {
  try {
    const response = await api.get('/categories', {
      params: {
        status: 'active',
        fields: '_id,name,slug,description,image',
        sort: 'name',
        limit: 100
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories for user panel:', error);
    throw error;
  }
};

// Get all categories
export const getCategories = async (params = {}) => {
  try {
    // Default parameters
    const defaultParams = {
      status: 'active',
      limit: 10,
      sort: 'name',
      fields: '_id,name,slug,description,image,courseCount,showOnHome',
      showOnHome: params.showOnHome ? 'true' : undefined
    };
    
    // Merge default params with provided params
    const requestParams = { ...defaultParams, ...params };
    
    // Remove undefined values
    Object.keys(requestParams).forEach(key => {
      if (requestParams[key] === undefined) {
        delete requestParams[key];
      }
    });
    
    const response = await api.get('/categories', { params: requestParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get a single category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    // The backend returns { success: true, data: { ...category } }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data; // Return just the category data
    }
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (formData) => {
  try {
    const response = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Update an existing category
export const updateCategory = async (id, formData) => {
  try {
    console.log('Sending update request to /categories/' + id);
    console.log('Request data:', formData);
    
    // Convert FormData to plain object for logging
    if (formData instanceof FormData) {
      const formDataObj = {};
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      console.log('FormData contents:', formDataObj);
    }
    
    const response = await api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'application/json', // Changed from multipart/form-data
      },
    });
    
    console.log('Update successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update failed:', error);
    console.error(`Error updating category with ID ${id}:`, error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
};
