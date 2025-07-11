// import { VITE_API_URL } from '../api/axios.js';
const VITE_API_URL= import.meta.env.VITE_API_URL;

/**
 * Get full image URL from a path
 * @param {string} path - Image path (can be relative or absolute)
 * @returns {string} Full image URL
 */
// export const getImageUrl = (path) => {
//   if (!path) return '';
  
//   // If it's already a full URL, return as is
//   if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
//     return path;
//   }
  
//   // If it's a path starting with /, use the API URL as base
//   if (path.startsWith('/')) {
//     return `${VITE_API_URL}${path}`;
//   }
  
//   // Otherwise, assume it's a relative path from the uploads directory
//   return `${VITE_API_URL}/public/uploads/${path}`;
// };
export const getImageUrl = (path) => {
  console.log('getImageUrl called with path:', path);
  
  if (!path) {
    console.log('No path provided, returning empty string');
    return '';
  }

  // For debugging - log the environment variables
  console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
  
  // If it's already a full URL with the correct path, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    console.log('Path is already a full URL, returning as is');
    return path;
  }

  // Extract just the filename part, removing any path components
  const filename = path.split('/').pop();
  console.log('Extracted filename:', filename);
  
  // Use the environment variable or fall back to current origin
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  
  // Try different URL patterns - the server might be expecting different paths
  const possiblePaths = [
    `${baseUrl}/uploads/${filename}`,                    // Pattern 1: /uploads/filename
    `${baseUrl}/public/uploads/${filename}`,            // Pattern 2: /public/uploads/filename
    `${baseUrl}/storage/${filename}`,                   // Pattern 3: /storage/filename
    `${baseUrl}/images/${filename}`,                    // Pattern 4: /images/filename
    `${baseUrl}/assets/uploads/${filename}`,            // Pattern 5: /assets/uploads/filename
    `https://firstvite.com/uploads/${filename}`,        // Hardcoded domain
    `https://firstvite.com/public/uploads/${filename}`, // Hardcoded with public
  ];
  
  console.log('Trying possible image paths:', possiblePaths);
  
  // For now, return the first pattern - we'll test which one works
  const url = possiblePaths[1]; // Try /public/uploads/ first
  console.log('Using URL:', url);
  
  return url;
};

/**
 * Get thumbnail URL with optional size parameters
 * @param {string} path - Original image path
 * @param {Object} options - Options for thumbnail generation
 * @param {number} [options.width=300] - Thumbnail width
 * @param {number} [options.height=200] - Thumbnail height
 * @param {boolean} [options.crop=true] - Whether to crop the image to exact dimensions
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (path, { width = 300, height = 200, crop = true } = {}) => {
  if (!path) return '';
  
  // For external images, return as is (or implement your CDN logic here)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // For local images, you might want to use an image processing service
  // This is a placeholder - adjust based on your backend capabilities
  const baseUrl = path.startsWith('/') ? VITE_API_URL : `${VITE_API_URL}/uploads`;
  const imagePath = path.startsWith('/') ? path : `/${path}`;
  
  // Example: Using a hypothetical image processing endpoint
  // return `${baseUrl}/image/process${imagePath}?width=${width}&height=${height}&crop=${crop}`;
  
  // For now, just return the full URL
  return `${baseUrl}${imagePath}`;
};

/**
 * Get avatar URL with fallback to default avatar
 * @param {string} avatarPath - User's avatar path
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (avatarPath) => {
  if (avatarPath) {
    return getImageUrl(avatarPath);
  }
  // Return default avatar URL
  return '/images/default-avatar.png';
};

/**
 * Get course thumbnail URL with fallback to default course image
 * @param {string} thumbnailPath - Course thumbnail path
 * @returns {string} Thumbnail URL
 */
export const getCourseThumbnail = (thumbnailPath) => {
  if (thumbnailPath) {
    return getImageUrl(thumbnailPath);
  }
  // Return default course thumbnail URL
  return '/images/course-placeholder.jpg';
};

/**
 * Preload an image
 * @param {string} src - Image URL to preload
 * @returns {Promise<HTMLImageElement>} Promise that resolves when image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
};
