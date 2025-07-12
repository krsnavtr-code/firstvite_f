import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaRegClock, FaUserGraduate } from 'react-icons/fa';
import axios from '../../api/axios';
import { getCardBgColor } from '../../utils/gradients';

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// CourseCard component for displaying individual course
const CourseCard = ({ course }) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Reset error state when course changes
    setImageError(false);
    
    console.log('Course data:', course); // Debug: Log course data
    
    if (!course.thumbnail) {
      console.log('No thumbnail found for course:', course.title);
      setImageUrl('/images/course-placeholder.jpg');
      return;
    }

    let url = course.thumbnail;
    console.log('Original thumbnail URL:', url); // Debug: Log original URL
    
    // If it's not already a full URL, construct it
    if (!url.startsWith('http') && !url.startsWith('https') && !url.startsWith('//')) {
      // Remove any leading slashes to avoid double slashes
      const cleanPath = url.replace(/^\/+/, '');
      const baseUrl = API_BASE_URL || '';
      url = `${baseUrl}/${cleanPath}`;
      console.log('Constructed image URL:', url); // Debug: Log constructed URL
    }
    
    // Test if the image exists
    const img = new Image();
    img.onload = () => {
      console.log('Image loaded successfully:', url);
      setImageUrl(url);
    };
    img.onerror = () => {
      console.error('Failed to load image:', url);
      setImageError(true);
      setImageUrl('/images/course-placeholder.jpg');
    };
    img.src = url;
    
    // Set a timeout to check if the image loads within 2 seconds
    const timeoutId = setTimeout(() => {
      if (!img.complete) {
        console.warn('Image loading timed out:', url);
        setImageError(true);
        setImageUrl('/images/course-placeholder.jpg');
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [course]);
  
  const handleImageError = () => {
    setImageError(true);
    setImageUrl('/images/course-placeholder.jpg');
  };

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  // Get background color class
  const bgColor = getCardBgColor(course);

  return (
    <div
      className={`${bgColor} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
    >
      <Link to={`/course/${course.slug || course._id}`}>
        <div className="relative pb-9/16">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {imageError || !course.thumbnail ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    No image available
                  </div>
                  {course.thumbnail && (
                    <div className="text-xs mt-2 text-gray-400 break-all max-w-xs">
                      Tried to load: {course.thumbnail}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <img
                  src={imageUrl}
                  alt={course.title || "Course image"}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  onLoad={() =>
                    console.log("Image loaded successfully:", imageUrl)
                  }
                  loading="lazy"
                />
                {/* Hidden debug info */}
                <div className="hidden">
                  <div>Image URL: {imageUrl}</div>
                  <div>Course ID: {course._id}</div>
                  <div>Course Title: {course.title}</div>
                </div>
              </>
            )}
          </div>
          {course.isFeatured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2 h-14">
            {course.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 h-10">
            {course.description?.replace(/^<p>/i, "").replace(/<\/p>$/i, "")}
          </p>
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {renderStars(course.rating || 0)}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              ({course.enrollmentCount || course.enrolledStudents || 0}{" "}
              students)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FaRegClock className="mr-1" />
              {course.duration || "Self-paced"}
            </div>
            <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
              {course.level || "All Levels"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        // First, get all categories
        const categoriesResponse = await axios.get('/categories');
        const categories = Array.isArray(categoriesResponse.data) 
          ? categoriesResponse.data 
          : categoriesResponse.data?.data || [];
        
        // Then get courses for each category
        const categoryPromises = categories.map(category => 
          axios.get('/courses', {
            params: {
              category: category._id,
              limit: 2, // Get 2 courses per category
              sort: '-enrollments',
            },
          })
        );

        const categoryResponses = await Promise.all(categoryPromises);
        
        // Process courses from all categories
        let allCourses = [];
        const usedCategories = new Set();
        
        // First pass: take one course from each category
        categoryResponses.forEach((response, index) => {
          const categoryCourses = Array.isArray(response.data) 
            ? response.data 
            : response.data?.data || [];
            
          if (categoryCourses.length > 0) {
            allCourses.push({
              ...categoryCourses[0],
              category: categories[index] // Ensure category info is included
            });
            usedCategories.add(categories[index]._id);
          }
        });
        
        // If we need more courses, take second course from each category
        if (allCourses.length < 6) {
          categoryResponses.forEach((response, index) => {
            if (allCourses.length >= 6) return;
            
            const categoryCourses = Array.isArray(response.data) 
              ? response.data 
              : response.data?.data || [];
              
            if (categoryCourses.length > 1) {
              allCourses.push({
                ...categoryCourses[1],
                category: categories[index] // Ensure category info is included
              });
            }
          });
        }
        
        // If still not enough, fetch more popular courses
        if (allCourses.length < 6) {
          const remaining = 6 - allCourses.length;
          const usedCourseIds = new Set(allCourses.map(c => c._id));
          
          const popularResponse = await axios.get('/courses', {
            params: {
              limit: Math.max(10, remaining * 2), // Get more to ensure we have enough unique courses
              sort: '-enrollments',
            },
          });
          
          const popularCourses = Array.isArray(popularResponse.data) 
            ? popularResponse.data 
            : popularResponse.data?.data || [];
            
          for (const course of popularCourses) {
            if (allCourses.length >= 6) break;
            if (!usedCourseIds.has(course._id)) {
              allCourses.push(course);
              usedCourseIds.add(course._id);
            }
          }
        }
        
        // Ensure we have exactly 6 courses
        setCourses(allCourses.slice(0, 6));
      } catch (err) {
        console.error('Error fetching popular courses:', err);
        setError('Failed to load popular courses');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center">
            Best E-Learning Courses
          </h1>
          <p className="mt-4 text-xl text-center text-gray-600 dark:text-gray-300">
            Discover the best courses for your learning journey
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PopularCourses;
