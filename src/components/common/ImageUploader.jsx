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
      
      const response = await fetch(`${API_URL}/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      console.log('Upload successful, response:', data);
      toast.success('Image uploaded successfully');
      
      if (onUploadSuccess && data.data) {
        onUploadSuccess({
          url: data.data.url,
          path: data.data.path,
          name: data.data.name
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl('');
    setFile(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
            ${previewUrl ? 'border-gray-300' : 'border-blue-500 hover:bg-blue-50 dark:border-blue-600 dark:hover:border-blue-500 dark:hover:bg-gray-700'}
            transition-colors duration-200`}
        >
          {previewUrl ? (
            <div className="relative w-full h-full group">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
              <FaUpload className="w-10 h-10 mb-3 text-blue-500 dark:text-blue-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, or WebP (MAX. {maxSizeMB}MB)
              </p>
            </div>
          )}
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/jpeg, image/png, image/webp, image/gif"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {file && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isUploading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
