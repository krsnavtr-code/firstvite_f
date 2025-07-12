import { useEffect, useState } from 'react';
import { getUploadedImages, getImageUrl } from '../../api/imageApi';
import { toast } from 'react-toastify';
import { FiCopy, FiRefreshCw, FiVideo, FiImage, FiUpload } from 'react-icons/fi';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ImageGallery = () => {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const response = await getUploadedImages();
      if (response && response.data) {
        // Add type to each media item if not present
        const mediaWithTypes = response.data.map(item => ({
          ...item,
          type: item.type || (item.mimetype?.startsWith('video/') ? 'video' : 'image')
        }));
        setMedia(mediaWithTypes);
      } else {
        console.error('Unexpected response format:', response);
        toast.error('Failed to load media: Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const filteredMedia = media.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    
    if (!searchTerm) return matchesTab;
    
    const searchLower = searchTerm.toLowerCase();
    const itemName = (item.filename || item.name || '').toLowerCase();
    const itemUrl = getImageUrl(item.name).toLowerCase();
    
    const matchesSearch = itemName.includes(searchLower) || itemUrl.includes(searchLower);
    
    return matchesTab && matchesSearch;
  });

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
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex space-x-2">
          <Link 
            to="/admin/media" 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            <FiUpload className="mr-2" />
            Upload Media
          </Link>
          <button
            onClick={fetchMedia}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            disabled={isLoading}
          >
            <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>



      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-2 overflow-x-auto pb-2 w-full sm:w-auto">
            {['all', 'image', 'video'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tab === 'all' ? 'All Media' : tab === 'image' ? 'Images' : 'Videos'}
                {tab !== 'all' && (
                  <span className="ml-1 bg-gray-100 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">
                    {tab === 'image' 
                      ? media.filter(m => m.type === 'image').length 
                      : media.filter(m => m.type === 'video').length}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item._id || item.name}
            className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800"
            onClick={() => setSelectedMedia(item)}
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {item.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <FaVideo className="text-blue-500 text-xl" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.name || 'Media'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.url);
                }}
                className="p-2 bg-white bg-opacity-90 rounded-full text-gray-800 hover:bg-opacity-100 transition-all"
                title="Copy URL"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 text-xs text-gray-600 dark:text-gray-300 truncate flex items-center justify-between">
              <span className="truncate">{item.name || 'Unnamed'}</span>
              <span className="ml-2 text-xs text-gray-400">
                {item.type === 'video' ? (
                  <FaVideo className="text-blue-500" />
                ) : (
                  <FaImage className="text-green-500" />
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && filteredMedia.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchTerm 
            ? 'No media found matching your search.'
            : 'No media found. Upload some files to get started.'}
        </div>
      )}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMedia(null)}>
          <div className="relative w-full max-w-5xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10 p-2"
              aria-label="Close"
            >
              <FaTimes size={24} />
            </button>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
              <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black">
                {selectedMedia.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    className="max-w-full max-h-[70vh]"
                    controls
                    autoPlay
                    controlsList="nodownload"
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name || 'Media'}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate" title={selectedMedia.name}>
                      {selectedMedia.name || 'Unnamed'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedMedia.size ? `${(selectedMedia.size / 1024).toFixed(2)} KB • ` : ''}
                      {selectedMedia.mimetype || selectedMedia.type}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <a
                      href={selectedMedia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
                      onClick={e => e.stopPropagation()}
                    >
                      Open in New Tab
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(selectedMedia.url);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FiCopy size={16} />
                      Copy URL
                    </button>
                  </div>
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
