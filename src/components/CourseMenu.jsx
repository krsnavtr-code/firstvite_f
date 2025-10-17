import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../api/categoryApi";
import { getCoursesByCategory } from "../api/courseApi";

const CourseMenu = ({ isMobile = false, onItemClick = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryCourses, setCategoryCourses] = useState({});
  const [isLoadingCourses, setIsLoadingCourses] = useState({});
  const [dropdownPosition, setDropdownPosition] = useState('bottom'); // 'top' or 'bottom'
  const menuRef = useRef(null);
  const dropdownRefs = useRef({});

  // Fetch categories with course counts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // console.log("Fetching all categories (without status filter)...");

        // First, try without any status filter to see all categories
        const response = await getCategories({
          // Remove status filter to see all categories
          limit: 12, // Increase limit to get all categories
          fields: "_id,name,slug,courseCount,isActive",
          sort: "name",
        });

        // console.log("Categories API Response (all categories):", response);

        // Process the response to extract categories
        let categoriesData = [];
        if (response) {
          // console.log("Raw response data:", response);

          // Extract categories array from response
          if (Array.isArray(response)) {
            // console.log("Response is a direct array");
            categoriesData = response;
          } else if (response.data && Array.isArray(response.data)) {
            // console.log("Response has data array");
            categoriesData = response.data;
          } else if (response.docs && Array.isArray(response.docs)) {
            console.log("Response has docs array");
            categoriesData = response.docs;
          }

          // console.log("Extracted categories:", categoriesData);

          // If no categories found, try one more time with different parameters
          if (categoriesData.length === 0) {
            console.log("No categories found, trying without any filters...");
            const fallbackResponse = await getCategories({});
            console.log("Fallback response:", fallbackResponse);

            if (Array.isArray(fallbackResponse)) {
              categoriesData = fallbackResponse;
            } else if (fallbackResponse?.data) {
              categoriesData = Array.isArray(fallbackResponse.data)
                ? fallbackResponse.data
                : [];
            }
          }
        }

        // Transform categories to match our menu structure
        const processedCategories = categoriesData
          .filter((cat) => cat && cat._id && cat.name)
          .map((category) => ({
            id: category._id,
            name: category.name,
            slug: category.slug || category._id,
            // icon: categoryIcons[category.slug?.toLowerCase()] || categoryIcons.default,
            courseCount: category.courses,
            subcategories: [
              {
                name: `All ${category.name} Courses`,
                url: `/courses/category/${category.slug || category._id}`,
                isAllCourses: true,
              },
            ],
          }));

        setCategories(processedCategories);
      } catch (err) {
        console.error("Error fetching categories:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: err.config,
        });
        setError("Failed to load categories. Please try again later.");
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch courses for a category
  const fetchCategoryCourses = useCallback(async (categoryId) => {
    if (!categoryId) return;

    try {
      console.log(`Fetching courses for category ID: ${categoryId}`);
      setIsLoadingCourses((prev) => ({ ...prev, [categoryId]: true }));

      // Pass the category ID as a query parameter
      const params = {
        limit: 5, // Limit to 5 courses initially
        fields:
          "_id,title,slug,description,price,discountPrice,image,rating,averageRating,totalReviews",
        status: "published",
        category: categoryId, // This should be at the root level of params
      };

      console.log("API call params:", params);
      // Pass the category ID as the first argument and params as the second
      const response = await getCoursesByCategory(categoryId, params);
      console.log("API response:", response);

      if (response && Array.isArray(response)) {
        console.log(`Received ${response.length} courses`);
        setCategoryCourses((prev) => ({
          ...prev,
          [categoryId]: response,
        }));
      } else if (response && response.data) {
        // Handle case where response has a data property
        const courses = Array.isArray(response.data) ? response.data : [];
        console.log(`Received ${courses.length} courses in response.data`);
        setCategoryCourses((prev) => ({
          ...prev,
          [categoryId]: courses,
        }));
      } else {
        console.log("No courses found in response");
        setCategoryCourses((prev) => ({
          ...prev,
          [categoryId]: [],
        }));
      }
    } catch (err) {
      console.error("Error fetching courses:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      setError("Failed to load courses. Please try again.");
    } finally {
      setIsLoadingCourses((prev) => ({ ...prev, [categoryId]: false }));
    }
  }, []);

  // Handle category hover with debounce
  // const handleCategoryHover = (categoryId) => {
  //   if (!categoryId) return;
  //   setActiveCategory(categoryId);

  //   // Only fetch if we haven't loaded courses for this category yet
  //   if (!categoryCourses[categoryId]) {
  //     fetchCategoryCourses(categoryId);
  //   }
  // };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle menu item click
  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsOpen(false);
      onItemClick();
    }
  };

  // Toggle category expansion and fetch courses if needed
  const toggleCategory = (categoryId) => {
    const newActiveCategory = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(newActiveCategory);

    if (newActiveCategory && !categoryCourses[newActiveCategory]) {
      fetchCategoryCourses(newActiveCategory);
    }
  };

  // Handle category hover for desktop
  const handleCategoryHover = (categoryId, event) => {
    if (!isMobile) {
      setActiveCategory(categoryId);
      
      // Calculate available space below the menu item
      if (event && event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setDropdownPosition(spaceBelow < 400 && spaceBelow < spaceAbove ? 'top' : 'bottom');
      }
      
      if (!categoryCourses[categoryId]) {
        fetchCategoryCourses(categoryId);
      }
    }
  };
  
  // Set dropdown ref for a category
  const setDropdownRef = (element, categoryId) => {
    if (element) {
      dropdownRefs.current[categoryId] = element;
    }
  };

  // ... (previous imports remain the same)

  return (
    <div className={`relative ${isMobile ? "w-full" : ""}`} ref={menuRef}>
      {/* Main Menu Button - Only show in desktop or as a toggle in mobile */}
      {!isMobile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center text-sm px-1 py-1 text-blue-900 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 bg-blue-200 dark:bg-blue-900/30 rounded transition-colors duration-200 font-medium"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-controls="course-menu-dropdown"
        >
          <span>Course Menu</span>
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* Dropdown Menu */}
      <div
        id="course-menu-dropdown"
        className={`${isOpen || isMobile ? "block" : "hidden"} ${
          isMobile
            ? "w-full bg-white dark:bg-gray-800 rounded-lg shadow-md mt-1 py-1"
            : "absolute left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
        }`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="course-menu-button"
      >
        {isMobile && (
          <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 px-2 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-gray-800 dark:text-white">
                Browse Categories & Courses
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (onItemClick) onItemClick();
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 -mr-1"
                aria-label="Close menu"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className={isMobile ? "p-2 relative z-10" : "p-2"}>
          {isLoading ? (
            <div className="flex justify-center p-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-2 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : categories.length > 0 ? (
            <div
              className={`space-y-0 ${
                isMobile ? "divide-y divide-gray-200 dark:divide-gray-700" : ""
              }`}
            >
              {categories
                .sort((a, b) => {
                  const order = {
                    "ERP Academy": 1,
                    "Professional Language": 2,
                    "Data Science & ML": 3,
                  };
                  const aOrder = order[a.name] || 999;
                  const bOrder = order[b.name] || 999;
                  return aOrder - bOrder;
                })
                .map((category) => (
                  <div
                    key={category.id}
                    className={`relative group ${isMobile ? "py-2" : "py-1"}`}
                  >
                    <div
                      ref={(el) => setDropdownRef(el, category.id)}
                      onClick={() => isMobile && toggleCategory(category.id)}
                      onMouseEnter={(e) =>
                        !isMobile && handleCategoryHover(category.id, e)
                      }
                      className={`cursor-pointer flex items-center justify-between rounded-lg transition-colors ${
                        isMobile
                          ? "px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                          : "px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span
                            className={`font-medium ${
                              isMobile
                                ? "text-base text-gray-800 dark:text-gray-100"
                                : "text-sm text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {category.name}
                          </span>
                        </div>
                        {(isMobile || activeCategory === category.id) && (
                          <svg
                            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transform transition-transform ${
                              activeCategory === category.id ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Course dropdown - shown on hover (desktop) or click (mobile) */}
                    {activeCategory === category.id && (
                      <div
                        className={`${
                          !isMobile
                            ? `absolute left-full ml-1 w-[400px] max-h-[80vh] overflow-y-auto ${
                                dropdownPosition === 'top' ? 'bottom-0' : 'top-0'
                              }`
                            : "w-full mt-2"
                        } bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50`}
                        onMouseEnter={() =>
                          !isMobile && handleCategoryHover(category.id)
                        }
                        onMouseLeave={() =>
                          !isMobile && setActiveCategory(null)
                        }
                      >
                        <div className="p-2">
                          <Link
                            to={`/courses/category/${
                              category.slug ||
                              category.name.toLowerCase().replace(/\s+/g, "-")
                            }`}
                            className="block px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t"
                            onClick={() => {
                              setIsOpen(false);
                              setActiveCategory(null);
                              if (onItemClick) onItemClick();
                            }}
                          >
                            View all {category.name} courses
                          </Link>

                          {isLoadingCourses[category.id] ? (
                            <div className="flex justify-center p-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                          ) : categoryCourses[category.id]?.length > 0 ? (
                            <div className="py-1">
                              {categoryCourses[category.id].map((course) => (
                                <Link
                                  key={course._id}
                                  to={`/course/${course.slug || course._id}`}
                                  className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                                  onClick={() => {
                                    setIsOpen(false);
                                    setActiveCategory(null);
                                    if (onItemClick) onItemClick();
                                  }}
                                >
                                  {course.title}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                              No courses found in this category.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
              No categories found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseMenu;
