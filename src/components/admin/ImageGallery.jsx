import { useEffect, useState } from 'react';
import { getUploadedImages, getImageUrl } from '../../api/imageApi';
import { toast } from 'react-toastify';
import { FiCopy, FiRefreshCw } from 'react-icons/fi';
import { FaImage } from 'react-icons/fa';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await getUploadedImages();
      if (response && response.data) {
        setImages(response.data);
      } else {
        console.error('Unexpected response format:', response);
        toast.error('Failed to load images: Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Image Gallery</h2>
        <button
          onClick={fetchImages}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <FaImage className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-600 dark:text-gray-300">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(images) && images.map((image, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={image.url || getImageUrl(image.name)}
                  alt={image.name}
                  className="w-full h-40 object-cover rounded-lg cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                  onError={(e) => {
                    console.error('Error loading image:', image);
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {image.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const urlToCopy = image.url || getImageUrl(image.name);
                      copyToClipboard(urlToCopy);
                    }}
                    className="text-gray-500 hover:text-blue-500"
                    title="Copy URL"
                  >
                    <FiCopy />
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={image.url || getImageUrl(image.name)}
                    className="w-full p-2 pr-8 text-xs bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(image.url || getImageUrl(image.name))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title="Copy URL"
                  >
                    <FiCopy size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedImage.name}</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 max-h-[70vh] overflow-auto">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="max-w-full h-auto mx-auto"
                />
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={selectedImage.url}
                    className="flex-1 p-2 pr-8 text-sm bg-gray-100 dark:bg-gray-700 rounded-l border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedImage.url)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors"
                  >
                    <FiCopy className="inline mr-1" /> Copy URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
