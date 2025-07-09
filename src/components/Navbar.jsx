import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Logout from "./Logout";
import { useAuth } from "../context/AuthProvider";
import { FaSun, FaMoon, FaSearch, FaUser, FaTimes } from "react-icons/fa";
import axios from "../api/axios";
import { debounce } from "lodash";

function Navbar() {
  const { authUser } = useAuth();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    courses: [],
    categories: []
  });
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const element = document.documentElement;
  useEffect(() => {
    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
      document.body.classList.add("dark");
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
      document.body.classList.remove("dark");
    }
  }, [theme]);

  // Handle search input change with debounce
  const handleSearch = debounce(async (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults({ courses: [], categories: [] });
      return;
    }

    try {
      setIsSearching(true);
      // Search courses with the query using the existing /courses endpoint with search parameter
      const response = await axios.get('/courses', {
        params: {
          search: trimmedQuery,
          limit: 10 // Limit the number of results for better performance
        }
      });
      
      // The backend returns courses directly or in a data property
      const courses = response.data?.data || response.data || [];
      
      setSearchResults({
        courses: Array.isArray(courses) ? courses : [],
        categories: []
      });
      
    } catch (error) {
      console.error('Search error:', error);
      // Fall back to client-side search if the API call fails
      handleClientSideSearch(trimmedQuery);
    } finally {
      setIsSearching(false);
    }
  }, 500); // Debounce to reduce API calls
  
  // Fallback client-side search if the API endpoint is not available
  const handleClientSideSearch = async (query) => {
    try {
      // Get all courses with a limit to avoid loading too much data
      const response = await axios.get('/courses', { params: { limit: 50 } });
      const allCourses = Array.isArray(response.data) ? response.data : 
                       (response.data?.data || []);
      
      if (!allCourses.length) {
        setSearchResults({ courses: [], categories: [] });
        return;
      }
      
      // Simple case-insensitive search on multiple fields
      const searchLower = query.toLowerCase();
      const filtered = allCourses.filter(course => {
        if (!course) return false;
        return (
          (course.title && course.title.toLowerCase().includes(searchLower)) ||
          (course.description && course.description.toLowerCase().includes(searchLower)) ||
          (course.instructor && course.instructor.toLowerCase().includes(searchLower)) ||
          (course.category?.name && course.category.name.toLowerCase().includes(searchLower))
        );
      });
      
      setSearchResults({
        courses: filtered,
        categories: []
      });
    } catch (error) {
      console.error('Client-side search error:', error);
      setSearchResults({ courses: [], categories: [] });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      handleSearch(query);
    } else {
      setSearchResults({ courses: [], categories: [] });
    }
  };

  // Handle search result click
  const handleResultClick = (type, item) => {
    if (!item) return;
    
    if (type === 'course') {
      // Check if the course has a slug, otherwise use _id
      const courseId = item.slug || item._id;
      console.log('Navigating to course:', { courseId, item });
      if (courseId) {
        // Try both /course/:id and /courses/:id to see which one works
        const path = `/course/${courseId}`;
        console.log('Navigating to path:', path);
        navigate(path);
        resetSearch();
      }
    } else if (type === 'category' && item._id) {
      console.log('Navigating to category:', item._id);
      navigate(`/courses/category/${item._id}`);
      resetSearch();
    }
  };
  
  // Reset search state
  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults({ courses: [], categories: [] });
    setShowResults(false);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      // If there are search results, navigate to the first one
      if (searchResults.courses.length > 0) {
        handleResultClick('course', searchResults.courses[0]);
      } else {
        // Otherwise, navigate to search results page
        navigate(`/search?q=${encodeURIComponent(query)}`);
        resetSearch();
      }
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const navItems = (
    <>
      <Link
        to="/"
        className="px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Home
      </Link>
      <Link
        to="/courses"
        className="px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Courses
      </Link>
      <Link
        to="/corporate-training"
        className="px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Corporate Training
      </Link>
      {authUser && (
        <Link
          to="/my-learning"
          className="px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          My Learning
        </Link>
      )}
    </>
  );
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        sticky
          ? "bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm shadow-md"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
              >
                <span style={{ color: "#F47C26" }}>First</span>
                <span style={{ color: "#1E90FF" }}>Vite</span>
              </Link>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
              {navItems}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowResults(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowResults(false);
                    }
                  }}
                  className="w-64 px-4 py-2 pl-10 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search courses..."
                  aria-label="Search courses"
                  autoComplete="off"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults({ courses: [], categories: [] });
                    }}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Clear search"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
                {showResults && searchQuery.trim() && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Searching...
                      </div>
                    ) : searchResults.courses.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No courses found
                      </div>
                    ) : (
                      <>
                        {searchResults.courses.length > 0 && (
                          <div className="border-b border-gray-200 dark:border-gray-700">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Courses
                            </div>
                            {searchResults.courses.map((course) => (
                              <button
                                key={course._id}
                                onClick={() =>
                                  handleResultClick("course", course)
                                }
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center"
                              >
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                                  <div className="text-gray-400 text-xs text-center p-1">
                                    {course.title?.charAt(0)?.toUpperCase() ||
                                      "C"}
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {course.title}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {course.instructor}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.categories.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Categories
                            </div>
                            {searchResults.categories.map((category) => (
                              <button
                                key={category._id}
                                onClick={() =>
                                  handleResultClick("category", category)
                                }
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                              >
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {category.name}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <FaSun className="w-5 h-5" />
              ) : (
                <FaMoon className="w-5 h-5" />
              )}
            </button>

            {/* User menu */}
            {authUser ? (
              <div className="relative ml-2">
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                  onClick={() =>
                    document
                      .getElementById("user-menu")
                      .classList.toggle("hidden")
                  }
                >
                  {authUser?.fullname?.charAt(0)?.toUpperCase() || (
                    <FaUser className="w-5 h-5" />
                  )}
                </button>

                {/* Dropdown menu */}
                <div
                  id="user-menu"
                  className="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                >
                  <div className="py-1" role="none">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Your Profile
                    </Link>
                    {authUser.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/my-learning"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      My Learning
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Settings
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <div className="px-4 py-2">
                      <Logout />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    document.getElementById("login_modal").showModal()
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Sign in
                </button>
                <button
                  onClick={() =>
                    document.getElementById("signup_modal").showModal()
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
                >
                  Sign up
                </button>
                <Login id="login_modal" />
                <Signup id="signup_modal" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">{navItems}</div>
      </div>
    </div>
  );
}

export default Navbar;
