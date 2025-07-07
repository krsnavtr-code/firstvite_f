import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCoursesByCategory } from "../../api/courseApi";
import { getCategories } from "../../api/categoryApi";
import { toast } from "react-hot-toast";
import { FaStar, FaUsers, FaClock } from "react-icons/fa";

const CoursesByCategory = () => {
  const { categoryName } = useParams();
  const [courses, setCourses] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all categories for the sidebar
        const categoriesData = await getCategories();
        setAllCategories(categoriesData);

        // If we have a categoryName, fetch courses for that category
        if (categoryName) {
          console.log('Category name from URL:', categoryName);
          // Decode the URL-encoded category name and replace hyphens with spaces
          const decodedCategoryName = decodeURIComponent(categoryName.replace(/-/g, ' '));
          console.log('Decoded category name:', decodedCategoryName);
          
          // First, find the category by name (case insensitive and trim whitespace)
          const categoryData = categoriesData.find(
            (cat) => cat.name.trim().toLowerCase() === decodedCategoryName.trim().toLowerCase()
          );
          
          console.log('Found category data:', categoryData);
          
          if (categoryData) {
            setCategory(categoryData);
            console.log('Fetching courses for category ID:', categoryData._id);
            const coursesData = await getCoursesByCategory(categoryData._id);
            console.log('Fetched courses:', coursesData);
            setCourses(coursesData);
          } else {
            // If category not found, clear the courses
            console.log('Category not found');
            setCategory(null);
            setCourses([]);
          }
        } else {
          // If no categoryId, show all courses or a featured selection
          const allCourses = await getCoursesByCategory();
          setCourses(allCourses);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:text-white mt-16">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              Home
            </Link>
          </li>
          <li className="text-gray-500 dark:text-gray-400">/</li>
          <li>
            <Link to="/courses" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              Courses
            </Link>
          </li>
          {category && (
            <>
              <li className="text-gray-500 dark:text-gray-400">/</li>
              <li className="text-blue-600 dark:text-blue-400 font-medium" aria-current="page">
                {category.name}
              </li>
            </>
          )}
        </ol>
      </nav>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar with categories */}
        <div className="w-full md:w-1/4 lg:w-1/5 mt-14">
          <div className="bg-white rounded-lg shadow-md dark:bg-slate-800 p-4 sticky top-4">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Categories
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/courses"
                  className={`block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    !categoryName
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 dark:text-white"
                  }`}
                >
                  All Courses
                </Link>
              </li>
              {allCategories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    to={`/courses/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      category?._id === cat._id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 dark:text-white"
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">
              {category ? `${category.name} Courses` : "All Courses"}
            </h1>
            <p>Totel Courses: {courses.length}</p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg dark:text-white">
                No courses found in this category.
              </p>
              <Link
                to="/courses"
                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Browse All Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ course }) => {
  // Function to get the full image URL with debugging
  const getImageUrl = (url) => {
    console.group('getImageUrl Debug');
    try {
      if (!url) {
        console.warn('No image URL provided, using placeholder');
        return '';
      }
      
      console.log('Original URL from database:', url);
      
      // Try direct access first (in case the backend serves from root)
      const directUrl = `http://localhost:4002${url.startsWith('/') ? '' : '/'}${url}`;
      console.log('Trying direct URL:', directUrl);
      
      // Create a test image to check if the URL is accessible
      const testImage = new Image();
      testImage.src = directUrl;
      
      // If the image loads successfully, use this URL
      testImage.onload = () => {
        console.log('✅ Image loaded successfully:', directUrl);
        return directUrl;
      };
      
      // If there's an error, try alternative URL formats
      testImage.onerror = () => {
        console.warn('❌ Failed to load image from direct URL, trying alternatives...');
        
        // Try with /public prefix if it's an upload
        if (url.startsWith('/uploads/')) {
          const publicUrl = `http://localhost:4002/public${url}`;
          console.log('Trying with /public prefix:', publicUrl);
          return publicUrl;
        }
        
        // Try with base URL
        const baseUrl = 'http://localhost:4002';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        const fullUrl = `${baseUrl}${cleanUrl}`;
        console.log('Trying with base URL:', fullUrl);
        return fullUrl;
      };
      
      // Return the direct URL initially, it will update if needed
      return directUrl;
    } catch (error) {
      console.error('Error in getImageUrl:', error);
      return '/images/course-placeholder.jpg';
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-slate-800 hover:shadow-lg transition-shadow duration-300">
      <Link to={`/course/${course.slug || course._id}`}>
        <div className="relative pb-9/16">
          <img
            src={getImageUrl(course.thumbnail)}
            alt={course.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.error('Error loading image:', course.thumbnail);
              e.target.onerror = null;
              e.target.src = "/images/course-placeholder.jpg";
            }}
            onLoad={() => console.log('Image loaded successfully:', course.thumbnail)}
          />
          {course.isFeatured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">
            {course.title}
          </h3>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="flex items-center mr-4">
              <FaStar className="text-yellow-400 mr-1" />
              {course.rating?.toFixed(1) || "New"}
            </span>
            <span className="flex items-center">
              <FaUsers className="mr-1" />
              {course.enrolledStudents || 0} students
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <FaClock className="mr-1" />
            {course.duration || "Self-paced"}
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">
              {course.price > 0 ? `$${course.price}` : "Free"}
              {course.originalPrice > course.price && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${course.originalPrice}
                </span>
              )}
            </span>
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              Enroll Now
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CoursesByCategory;
