 import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaTimes } from 'react-icons/fa';

const ImageUploader = ({ onUploadSuccess, label = 'Upload Image', className = '', maxSizeMB = 5 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    // Check file size (default 5MB)
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (selectedFile.size > maxSize) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const fileUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(fileUrl);
    setFile(selectedFile);
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api';
      
      // Add cache-busting parameter
      const url = new URL(`${API_URL}/upload/image`);
      url.searchParams.append('_t', Date.now());
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: formData,
      });

      // Log response details for debugging
      console.log('Image upload response status:', response.status);
      const responseText = await response.text();
      console.log('Image upload response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      console.log('Image upload successful, response:', data);
      toast.success('Image uploaded successfully');
      
      if (onUploadSuccess) {
        // Handle both response formats for backward compatibility
        const result = data.data || data;
        if (result) {
          onUploadSuccess({
            url: result.url || result.path,
            path: result.path,
            name: result.name || file.name,
            type: 'image'
          });
        }
      }
      
      // Clean up
      removeImage();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
            ${previewUrl ? 'border-gray-300' : 'border-blue-500 hover:bg-blue-50 dark:border-blue-600 dark:hover:border-blue-500 dark:hover:bg-gray-700'}
            transition-colors duration-200 relative`}
        >
          {previewUrl ? (
            <div className="relative w-full h-full group">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.svg';
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <FaUpload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, WebP, GIF (MAX. {maxSizeMB}MB)
              </p>
            </div>
          )}
          <input
            id="image-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
