import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories as getCategoriesFromApi } from "../../api/categoryApi";
import { getCoursesByCategory } from "../../api/courseApi";
import { FaImage, FaArrowRight } from 'react-icons/fa';

// Helper function to get the full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, prepend the API base URL
  return `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${imagePath}`;
};

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoriesWithCount = async () => {
      try {
        // First, fetch all categories with pagination
        const response = await getCategoriesFromApi({ limit: 100 });
        
        // Extract categories from the response (handling both direct array and paginated response)
        const categoriesData = Array.isArray(response) ? response : 
                             (response?.data || []);
        
        if (!categoriesData.length) {
          setError('No categories found.');
          setLoading(false);
          return;
        }
        
        // Then, fetch course count for each category
        const categoriesWithCount = await Promise.all(
          categoriesData.map(async (category) => {
            if (!category || !category._id) return null;
            
            try {
              const courses = await getCoursesByCategory(category._id);
              return {
                ...category,
                courseCount: Array.isArray(courses) ? courses.length : 0
              };
            } catch (err) {
              console.error(`Error fetching courses for category ${category.name || 'unknown'}:`, err);
              return {
                ...category,
                courseCount: 0
              };
            }
          })
        );
        
        // Filter out any null categories that might have been returned
        const validCategories = categoriesWithCount.filter(Boolean);
        setCategories(validCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithCount();
  }, []);

  const renderCategoryImage = (category) => {
    const imageUrl = category.image ? getImageUrl(category.image) : null;
    
    return (
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, show the default icon
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
        ) : null}
        {!imageUrl && (
          <FaImage className="text-gray-400 text-2xl" />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            All Categories
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Explore our wide range of course categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/courses/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {renderCategoryImage(category)}
                  <FaArrowRight className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {category.courseCount || 0} courses
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCategories;
