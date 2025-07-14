import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCoursesByCategory } from "../../api/courseApi";
import { getCategories } from "../../api/categoryApi";
import { toast } from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtils";
import { FaStar, FaUsers, FaClock } from "react-icons/fa";
import { getCardBgColor } from "../../utils/gradients";
import { formatPrice } from "../../utils/format";

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
        console.log('Fetching categories...');
        const response = await getCategories({ limit: 100 }); // Get all categories with a higher limit
        
        // Handle paginated response
        const categoriesData = response.data || [];
        console.log('Categories fetched:', categoriesData);
        setAllCategories(categoriesData);

        // Reset category state when component mounts or categoryName changes
        setCategory(null);

        if (categoryName) {
          console.log('Category name from URL:', categoryName);
          // Decode the URL-encoded category name and replace hyphens with spaces
          const decodedCategoryName = decodeURIComponent(categoryName.replace(/-/g, ' '));
          console.log('Decoded category name:', decodedCategoryName);
          
          // Find the category by name (case insensitive and trim whitespace)
          const categoryData = categoriesData.find(
            (cat) => cat?.name?.trim().toLowerCase() === decodedCategoryName.trim().toLowerCase()
          );
          
          console.log('Found category data:', categoryData);
          
          if (categoryData) {
            setCategory(categoryData);
            console.log('Fetching courses for category ID:', categoryData._id);
            const coursesResponse = await getCoursesByCategory(categoryData._id);
            // Handle both array and paginated response
            const coursesData = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse.data || []);
            console.log('Fetched courses:', coursesData);
            setCourses(coursesData);
            return; // Exit early after handling category courses
          } else {
            console.log('Category not found, showing all courses');
          }
        }
        
        // If no category or category not found, show all courses
        console.log('Fetching all courses');
        const allCoursesResponse = await getCoursesByCategory();
        // Handle both array and paginated response
        const allCourses = Array.isArray(allCoursesResponse) ? allCoursesResponse : (allCoursesResponse.data || []);
        setCourses(allCourses);
        setCategory(null); // Ensure category is cleared when showing all courses
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
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 dark:text-white mt-16">
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
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sticky top-4 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Categories
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/courses"
                  onClick={() => {
                    setCategory(null);
                    setCourses([]);
                  }}
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {category ? `${category.name} Courses` : "All Courses"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Total Courses: {courses.length}</p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                No courses found in this category.
              </p>
              <Link
                to="/courses"
                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
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
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Reset error state when course changes
    setImageError(false);
    
    console.log('Course data:', course);
    console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
    
    if (!course.thumbnail) {
      console.log('No thumbnail found, using placeholder');
      setImageUrl('/images/course-placeholder.jpg');
      return;
    }

    console.log('Raw thumbnail path from API:', course.thumbnail);
    const url = getImageUrl(course.thumbnail);
    console.log('Constructed image URL:', url);
    
    // Test if the image exists
    const img = new Image();
    img.onload = () => {
      console.log('Image loaded successfully:', url);
      setImageUrl(url);
    };
    img.onerror = () => {
      console.error('Failed to load image:', url);
      console.log('Image element error details:', {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        src: img.src
      });
      setImageError(true);
      setImageUrl('/images/course-placeholder.jpg');
    };
    
    console.log('Setting image source to:', url);
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

  return (
    <div
      className={`${getCardBgColor(
        course
      )} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500`}
    >
      <Link to={`/course/${course.slug || course._id}`}>
        <div className="relative pb-9/16">
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {imageError || !course.thumbnail ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                <span className="text-gray-500 dark:text-gray-400">
                  No image available
                </span>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={course.title || "Course image"}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            )}
          </div>
          {course.isFeatured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14 text-gray-800 dark:text-white">
            {course.title}
          </h3>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span className="flex items-center mr-4">
              <FaStar className="text-yellow-400 mr-1" />
              {course.rating?.toFixed(1) || "New"}
            </span>
            <span className="flex items-center">
              <FaUsers className="mr-1 text-gray-600 dark:text-gray-300" />
              {course.enrolledStudents || 0} students
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
            <FaClock className="mr-1 text-gray-600 dark:text-gray-300" />
            {course.duration || "Self-paced"}
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {course.price > 0 ? `${formatPrice(course.price)}` : "Free"}
              {course.originalPrice > course.price && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(course.originalPrice)}
                </span>
              )}
            </span>
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors duration-200">
              Enroll Now
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CoursesByCategory;
