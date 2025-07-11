import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api';

// Helper function to extract filename from URL or path
const getFilename = (urlOrPath) => {
    if (!urlOrPath) return '';
    // Handle both URLs and paths
    const parts = urlOrPath.split(/[\\/]/);
    return parts[parts.length - 1];
};

// Helper function to get the full image URL
export const getImageUrl = (filename) => {
    if (!filename) return '';
    
    // If it's already a full URL, convert it to use our API endpoint
    if (filename.startsWith('http')) {
        const url = new URL(filename);
        const pathParts = url.pathname.split('/');
        const cleanFilename = pathParts[pathParts.length - 1];
        return `${API_URL}/upload/file/${encodeURIComponent(cleanFilename)}`;
    }
    
    // If it's a path, extract just the filename
    const cleanFilename = getFilename(filename);
    return `${API_URL}/upload/file/${encodeURIComponent(cleanFilename)}`;
};

// Get all uploaded images
export const getUploadedImages = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/upload/images`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      withCredentials: true
    });
    
    // Transform the response to include full URLs
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map(image => {
        // Always use the filename from the image object
        const filename = image.name || getFilename(image.url) || getFilename(image.path);
        const url = getImageUrl(filename);
        return {
          ...image,
          name: filename, // Ensure we have the clean filename
          url: url,
          thumbnailUrl: url
        };
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

// Upload an image
export const uploadImage = async (file) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading file:', file.name);
    const response = await axios.post(`${API_URL}/upload/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
      withCredentials: true
    });
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};
