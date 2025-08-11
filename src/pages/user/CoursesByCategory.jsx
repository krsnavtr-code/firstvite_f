import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import SEO from "../../components/SEO";
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
          console.log('Category slug from URL:', categoryName);
          
          // First try to find by slug (exact match)
          let categoryData = categoriesData.find(
            (cat) => cat?.slug?.toLowerCase() === categoryName.toLowerCase()
          );
          
          // If not found by slug, try by name (with spaces replaced by hyphens)
          if (!categoryData) {
            categoryData = categoriesData.find(
              (cat) => cat?.name?.toLowerCase().replace(/\s+/g, '-') === categoryName.toLowerCase()
            );
          }
          
          // If still not found, try by name (with spaces)
          if (!categoryData) {
            const decodedCategoryName = decodeURIComponent(categoryName.replace(/-/g, ' '));
            categoryData = categoriesData.find(
              (cat) => cat?.name?.trim().toLowerCase() === decodedCategoryName.trim().toLowerCase()
            );
          }
          
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

  // Format category name for display (replace hyphens with spaces and capitalize)
  const formattedCategoryName = categoryName
    ? categoryName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Category';

  // Generate SEO metadata
  const seoTitle = `${formattedCategoryName} Courses | FirstVITE`;
  const seoDescription = `Explore our ${formattedCategoryName} courses. Enhance your skills with expert-led training and industry-relevant curriculum.`;
  const seoKeywords = `${formattedCategoryName} courses, ${formattedCategoryName} training, ${formattedCategoryName} certification, online ${formattedCategoryName} courses`;
  const canonicalUrl = `https://firstvite.com/courses/category/${categoryName}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={canonicalUrl}
        og={{
          title: `Best ${formattedCategoryName} Courses Online | FirstVITE`,
          description: `Learn ${formattedCategoryName} from industry experts. Enroll now for hands-on training and certification.`,
          type: 'website',
          url: canonicalUrl
        }}
      />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
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
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sticky top-4 border border-gray-200 dark:border-gray-700 h-[calc(100vh-6rem)] flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Categories
            </h2>
            <div className="overflow-y-auto flex-1 pr-2 -mr-2">
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
                      : "text-black dark:text-white"
                  }`}
                >
                  All Courses
                </Link>
              </li>
              {allCategories
                .sort((a, b) => {
                  const order = {
                    "ERP Academy": 1,
                    "Professional Language": 2,
                    "Data Science & ML": 3,
                  };
                  const aOrder = order[a.name] || 999;
                  const bOrder = order[b.name] || 999;
                  return aOrder - bOrder || a.name.localeCompare(b.name);
                })
                .map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={`/courses/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`block px-1 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        category?._id === cat._id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-black dark:text-white"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {category ? `${category.name} Courses` : "All Courses"}
            </h1>
            <p className="text-black dark:text-white">Total Courses: {courses.length}</p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black dark:text-white text-lg">
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
    </div>
  );
};

const CourseCard = ({ course }) => {
  const [imageState, setImageState] = useState({
    url: '',
    isLoading: true,
    hasError: false
  });

  useEffect(() => {
    let isMounted = true;
    let img = null;
    let timeoutId = null;
    
    const loadImage = async () => {
      if (!course.thumbnail) {
        if (isMounted) {
          setImageState({
            url: '/images/course-placeholder.jpg',
            isLoading: false,
            hasError: true
          });
        }
        return;
      }

      try {
        const url = getImageUrl(course.thumbnail);
        console.log('Loading image:', url);
        
        if (isMounted) {
          setImageState({
            url: url,
            isLoading: true,
            hasError: false
          });
        }

        // Create image element to test loading
        img = new Image();
        
        // Set up load/error handlers
        const onLoad = () => {
          if (isMounted) {
            console.log('Image loaded successfully');
            setImageState({
              url: url,
              isLoading: false,
              hasError: false
            });
          }
        };
        
        const onError = (e) => {
          console.warn('Failed to load image:', url, e);
          if (isMounted) {
            setImageState({
              url: '/images/course-placeholder.jpg',
              isLoading: false,
              hasError: true
            });
          }
        };
        
        // Set up event listeners
        img.onload = onLoad;
        img.onerror = onError;
        
        // Start loading the image
        img.src = url;
        
        // Set a timeout to handle slow loading
        timeoutId = setTimeout(() => {
          if (isMounted && img && !img.complete) {
            console.warn('Image load timed out:', url);
            // Only set error state if the image hasn't loaded yet
            if (isMounted) {
              setImageState({
                url: '/images/course-placeholder.jpg',
                isLoading: false,
                hasError: true
              });
            }
          }
        }, 5000);
        
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          setImageState({
            url: '/images/course-placeholder.jpg',
            isLoading: false,
            hasError: true
          });
        }
      }
    };
    
    // Start loading the image
    loadImage();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (img) {
        img.onload = null;
        img.onerror = null;
        img = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [course.thumbnail]);
  
  const handleImageError = (e) => {
    console.error('Image error:', e);
    setImageState(prev => ({
      ...prev,
      url: '/images/course-placeholder.jpg',
      isLoading: false,
      hasError: true
    }));
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
            {imageState.isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <div className="animate-pulse w-full h-full bg-gray-300 dark:bg-gray-600"></div>
              </div>
            ) : imageState.hasError || !course.thumbnail ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <span className="text-black dark:text-white">
                  No image available
                </span>
              </div>
            ) : (
              <div className="w-full h-[200px] bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                <img
                  src={imageState.url}
                  alt={course.title || "Course image"}
                  className="max-w-full max-h-full object-contain transition-opacity duration-300"
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
            )}
          </div>
          {course.isFeatured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14 text-black dark:text-white">
            {course.title}
          </h3>

          <div className="flex items-center text-sm text-black dark:text-gray-300 mb-2">
            <span className="flex items-center mr-4">
              <FaStar className="text-yellow-400 mr-1" />
              {course.rating?.toFixed(1) || "New"}
            </span>
            <span className="flex items-center">
              <FaUsers className="mr-1 text-gray-600 dark:text-gray-300" />
              {course.enrolledStudents || 0} students
            </span>
          </div>

          <div className="flex items-center text-sm text-black dark:text-gray-300 mb-3">
            <FaClock className="mr-1 text-gray-600 dark:text-gray-300" />
            {course.duration || "Self-paced"} Weeks
          </div>

          <div className="flex flex-col justify-between">
            <span className="font-bold text-lg text-black dark:text-white">
              {course.price > 0 ? `${formatPrice(course.price)}` : "Free"}
              {course.originalPrice > course.price && (
                <span className="ml-2 text-sm text-black dark:text-gray-400 line-through">
                  {formatPrice(course.originalPrice)}
                </span>
              )}
            </span>
            <button className="w-1/2 self-end px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors duration-200">
              Enroll Now
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CoursesByCategory;
