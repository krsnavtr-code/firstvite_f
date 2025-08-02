import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../api/categoryApi";
import { getCoursesByCategory } from "../api/courseApi";

const CourseMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryCourses, setCategoryCourses] = useState({});
  const [isLoadingCourses, setIsLoadingCourses] = useState({});
  const menuRef = useRef(null);

  // Fetch categories with course counts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching all categories (without status filter)...");

        // First, try without any status filter to see all categories
        const response = await getCategories({
          // Remove status filter to see all categories
          limit: 12, // Increase limit to get all categories
          fields: "_id,name,slug,courseCount,isActive",
          sort: "name",
        });

        console.log("Categories API Response (all categories):", response);

        // Process the response to extract categories
        let categoriesData = [];
        if (response) {
          console.log("Raw response data:", response);

          // Extract categories array from response
          if (Array.isArray(response)) {
            console.log("Response is a direct array");
            categoriesData = response;
          } else if (response.data && Array.isArray(response.data)) {
            console.log("Response has data array");
            categoriesData = response.data;
          } else if (response.docs && Array.isArray(response.docs)) {
            console.log("Response has docs array");
            categoriesData = response.docs;
          }

          console.log("Extracted categories:", categoriesData);

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
            courseCount: category.courseCount || 0,
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
  const fetchCategoryCourses = useCallback(
    async (categoryId) => {
      if (!categoryId || categoryCourses[categoryId]) return; // Already fetched or invalid ID

      try {
        setIsLoadingCourses((prev) => ({ ...prev, [categoryId]: true }));

        // Fetch courses for this category
        console.log(`Fetching courses for category ID: ${categoryId}`);
        const response = await getCoursesByCategory(categoryId);

        // Log the response for debugging
        console.log(`Courses for category ${categoryId}:`, response);

        // Handle different response formats
        const courses = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        setCategoryCourses((prev) => ({
          ...prev,
          [categoryId]: courses,
        }));
      } catch (err) {
        console.error(
          `Error fetching courses for category ${categoryId}:`,
          err
        );
        setCategoryCourses((prev) => ({
          ...prev,
          [categoryId]: [],
        }));
      } finally {
        setIsLoadingCourses((prev) => ({ ...prev, [categoryId]: false }));
      }
    },
    [categoryCourses]
  );

  // Handle category hover with debounce
  const handleCategoryHover = (categoryId) => {
    if (!categoryId) return;
    setActiveCategory(categoryId);

    // Only fetch if we haven't loaded courses for this category yet
    if (!categoryCourses[categoryId]) {
      fetchCategoryCourses(categoryId);
    }
  };

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

  return (
    <div className="relative" ref={menuRef}>
      {/* Main Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex text-sm items-center px-1 py-1 text-blue-900 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 bg-blue-200 dark:bg-blue-900/30 rounded transition-colors duration-200 font-medium"
      >
        <span>Course Menu</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Browse Categories
              </h3>
            </div>

            <div className="space-y-1">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              ) : categories.length > 0 ? (
                // Sort categories with specific order: SAP, Professional Language, Data Science & ML, then others
                [...categories]
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
                      className="relative group"
                      onMouseEnter={() => handleCategoryHover(category.id)}
                    >
                      <p className="cursor-pointer flex items-center justify-between px-0 py-0 text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600">
                        <div className="flex items-center">
                          <span className={`font-medium ${activeCategory === category.id ? 'text-blue-600' : ''}`}>
                            {category.name}
                            {category.courseCount > 0 && (
                              <span className={`ml-2 text-xs ${activeCategory === category.id ? 'text-blue-500' : 'text-gray-500'}`}>
                                ({category.courseCount})
                              </span>
                            )}
                          </span>
                        </div>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </p>

                      {/* Course List - Only show if category has courses */}
                      {activeCategory === category.id && (
                        <div
                          ref={(el) => {
                            if (!el) return;
                            const rect = el.getBoundingClientRect();
                            const viewportHeight =
                              window.innerHeight ||
                              document.documentElement.clientHeight;
                            const shouldOpenUp =
                              rect.bottom > viewportHeight - 20; // 20px buffer from bottom

                            if (shouldOpenUp) {
                              el.style.top = "auto";
                              el.style.bottom = "0";
                            } else {
                              el.style.top = "0";
                              el.style.bottom = "auto";
                            }
                          }}
                          className="absolute left-full ml-1 w-[400px] bg-white rounded-r-lg shadow-lg border-l-0 border border-gray-200 z-50"
                        >
                          <div className="p-2">
                            <Link
                              to={`/courses/category/${encodeURIComponent(
                                category.name.toLowerCase().replace(/\s+/g, '-')
                              )}`}
                              className="px-3 py-2 text-sm font-medium text-blue-600 border-b border-gray-100 hover:bg-gray-50"
                              onClick={() => {
                                setIsOpen(false);
                                setActiveCategory(null);
                              }}
                            >
                              All {category.name} Courses
                            </Link>

                            {isLoadingCourses[category.id] ? (
                              <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                              </div>
                            ) : categoryCourses[category.id]?.length > 0 ? (
                              <div className="py-1">
                                {(category.name === 'ERP Academy' 
                                  ? [...categoryCourses[category.id]]
                                      .sort((a, b) => {
                                        const order = {
                                          'SAP FICO Training Course': 1,
                                          'SAP MM Training Course': 2,
                                          'SAP PP Training Course': 3,
                                        };
                                        const aOrder = order[a.title] || 999;
                                        const bOrder = order[b.title] || 999;
                                        return aOrder - bOrder;
                                      })
                                  : categoryCourses[category.id])
                                  .slice(0, 5)
                                  .map((course) => (
                                    <Link
                                      key={course._id}
                                      to={`/course/${
                                        course.slug || course._id
                                      }`}
                                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 truncate hover:text-blue-500"
                                      title={course.title}
                                      onClick={() => {
                                        setIsOpen(false);
                                        setActiveCategory(null);
                                      }}
                                    >
                                      <i className="fa-solid fa-arrow-right"></i>{" "}
                                      {course.title}
                                    </Link>
                                  ))}
                                {category.courseCount > 5 && (
                                  <Link
                                    to={`/courses/category/${
                                      category.slug ||
                                      category.name
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                    }`}
                                    onClick={() => {
                                      setIsOpen(false);
                                      setActiveCategory(null);
                                    }}
                                    className="block px-3 py-2 mt-1 text-xs font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-100"
                                  >
                                    View all {category.courseCount} courses →
                                  </Link>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 text-sm text-gray-500">
                                {category.courseCount > 0
                                  ? "Loading courses..."
                                  : "No courses found in this category."}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="p-3 text-sm text-gray-500">
                  No categories found in menu
                </div>
              )}

              {/* All Categories Link */}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <Link
                  to="/categories"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <span>View all categories</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>

                <Link
                  to="/courses"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <span>View all courses</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseMenu;
