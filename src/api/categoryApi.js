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
      fields: '_id,name,slug,description,image,courseCount'
    };
    
    // Merge default params with provided params
    const requestParams = { ...defaultParams, ...params };
    
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
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update an existing category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
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
