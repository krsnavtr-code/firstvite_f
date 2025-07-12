import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaVideo, FaTimes } from 'react-icons/fa';

const VideoUploader = ({ onUploadSuccess, label = 'Upload Video', className = '', maxSizeMB = 100 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Check file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Only MP4, WebM, or QuickTime videos are allowed');
      return;
    }

    // Check file size (default 100MB)
    const maxSize = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error(`Video size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const fileUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(fileUrl);
    setFile(selectedFile);
  };

  const removeVideo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a video to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api';
      
      // Show uploading toast
      const toastId = toast.loading('Uploading video...');
      
      try {
        const response = await fetch(`${API_URL}/upload/video`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          credentials: 'include',
          body: formData,
        });

        let data;
        try {
          const responseText = await response.text();
          try {
            data = responseText ? JSON.parse(responseText) : {};
          } catch (e) {
            console.error('Failed to parse JSON response:', e, 'Response:', responseText);
            if (response.status === 413) {
              throw new Error('File is too large. Maximum size is 1GB.');
            } else if (responseText.includes('Request Entity Too Large')) {
              throw new Error('File is too large. Maximum size is 1GB.');
            } else {
              throw new Error('Server returned an invalid response. Please try again.');
            }
          }
        } catch (e) {
          if (e.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
          }
          throw e; // Re-throw other errors
        }

        if (!response.ok) {
          throw new Error(data.message || `Upload failed with status ${response.status}`);
        }

        // Update toast to success
        toast.update(toastId, {
          render: 'Video uploaded successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
        });

        if (onUploadSuccess) {
          onUploadSuccess({
            ...data.data,
            url: data.data.url || `${API_URL}${data.data.path}`,
            type: 'video'
          });
        }
        
      } catch (error) {
        console.error('Video upload error:', error);
        
        // Update toast to error
        toast.update(toastId, {
          render: error.message || 'Failed to upload video',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error('Video upload error:', error);
      // Error toast is already shown by the inner catch
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div 
        className="flex items-center justify-center w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <label
          htmlFor="video-upload"
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer 
            ${previewUrl ? 'border-gray-300' : 'border-blue-500 hover:bg-blue-50 dark:border-blue-600 dark:hover:border-blue-500 dark:hover:bg-gray-700'}
            transition-colors duration-200 relative`}
        >
          {previewUrl ? (
            <div className="relative w-full h-full group">
              <video 
                className="w-full h-full object-cover rounded-lg"
                controls
                src={previewUrl}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeVideo();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <FaVideo className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload video</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                MP4, WebM or MOV (MAX. {maxSizeMB}MB)
              </p>
            </div>
          )}
          <input
            id="video-upload"
            type="file"
            className="hidden"
            accept="video/mp4,video/webm,video/quicktime"
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
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </div>
    </div>
  );
};

export default VideoUploader;
