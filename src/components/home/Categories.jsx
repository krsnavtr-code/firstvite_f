import React, { useState, useEffect } from 'react';
import { getCategories as getCategoriesFromApi } from '../../api/categoryApi';
import { getCoursesByCategory } from '../../api/courseApi';
import { FaBook, FaLaptopCode, FaChartLine, FaPalette, FaLanguage, FaMusic, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getCardBgColor } from '../../utils/gradients';

const categoryIcons = {
  'Computer Science': <FaLaptopCode className="text-3xl text-blue-500" />,
  'Business': <FaChartLine className="text-3xl text-green-500" />,
  'Arts & Design': <FaPalette className="text-3xl text-purple-500" />,
  'Language': <FaLanguage className="text-3xl text-red-500" />,
  'Music': <FaMusic className="text-3xl text-pink-500" />,
  'default': <FaBook className="text-3xl text-yellow-500" />
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch top 6 categories
        const categoriesData = await getCategoriesFromApi({
          limit: 6,
          sort: '-courseCount', // Sort by course count in descending order
          fields: '_id,name,slug,courseCount'
        });

        // If courseCount is not populated from the backend, we'll fetch it manually
        const categoriesWithCount = await Promise.all(
          categoriesData.map(async (category) => {
            if (category.courseCount === undefined) {
              try {
                const courses = await getCoursesByCategory(category._id);
                return {
                  ...category,
                  courseCount: Array.isArray(courses) ? courses.length : 0
                };
              } catch (err) {
                console.error(`Error fetching courses for category ${category.name}:`, err);
                return { ...category, courseCount: 0 };
              }
            }
            return category;
          })
        );

        setCategories(categoriesWithCount);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (categoryName) => {
    const iconKey = Object.keys(categoryIcons).find(key => 
      categoryName.toLowerCase().includes(key.toLowerCase())
    );
    return iconKey ? categoryIcons[iconKey] : categoryIcons.default;
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Explore Categories
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Discover books in your favorite categories
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/courses/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`block p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${getCardBgColor(category)}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-lg">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {category.courseCount || 0} courses
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No categories found.</p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link to="/categories" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
