import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaSun,
  FaMoon,
  FaSearch,
  FaUser,
  FaTimes,
  FaBars,
  FaSignInAlt,
  FaUserPlus,
  FaCreditCard,
  FaCopy,
  FaCheck,
  FaExclamationCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import CourseMenu from "./CourseMenu";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import api from "../api/axios";
import PaymentForm from "./PaymentForm";

function Navbar() {
  const { authUser, isAuthenticated, isAdmin, isApproved, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside the dropdown and not on the payment button
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          !event.target.closest('[data-payment-button]')) {
        setShowPaymentDropdown(false);
      }
    };

    // Use 'click' instead of 'mousedown' for better reliability
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const courseMenuRef = useRef(null);

  const handlePaymentClick = () => {
    // if (!isAuthenticated) {
    //   toast.error("Please log in to make a payment");
    //   navigate("/login", { state: { from: location.pathname } });
    //   return;
    // }
    setShowPaymentForm(true);
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Cleanup any other event listeners if needed
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile menu if click is outside
      const profileMenu = document.getElementById("user-menu");
      const profileButton = document.querySelector('[aria-label="User menu"]');

      if (
        profileMenu &&
        profileButton &&
        !profileMenu.contains(event.target) &&
        !profileButton.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }

      // Close mobile menu if click is outside
      const mobileMenu = document.querySelector(".mobile-menu-container");
      const menuButton = document.querySelector('[aria-label="Toggle menu"]');

      if (
        mobileMenu &&
        menuButton &&
        isMobileMenuOpen &&
        !mobileMenu.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    // Close modals when clicking outside
    const handleModalClick = (event) => {
      const modals = document.querySelectorAll("dialog[open]");
      modals.forEach((modal) => {
        if (!modal.contains(event.target) && event.target !== modal) {
          modal.close();
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("click", handleModalClick);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("click", handleModalClick);
    };
  }, [isMobileMenuOpen]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    courses: [],
    categories: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchRef = useRef(null);
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
      // Search courses using the API endpoint
      const response = await api.get("/courses", {
        params: {
          search: trimmedQuery,
          limit: 10, // Limit the number of results for better performance
        },
      });

      // The backend returns courses directly or in a data property
      const courses = response?.data?.data || response?.data || [];

      setSearchResults({
        courses: Array.isArray(courses) ? courses : [],
        categories: [],
      });
    } catch (error) {
      console.error("Search error:", error);
      // Only show error if it's not a 404 or 500
      if (error.response?.status !== 404 && error.response?.status !== 500) {
        toast.error(
          "Error fetching search results. Using local search instead."
        );
      }
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
      const response = await api.get("/courses", { params: { limit: 50 } });
      const allCourses = Array.isArray(response?.data)
        ? response?.data
        : response?.data?.data || [];

      if (!allCourses?.length) {
        setSearchResults({ courses: [], categories: [] });
        return;
      }

      // Simple case-insensitive search on multiple fields
      const searchLower = query.toLowerCase();
      const filtered = allCourses.filter((course) => {
        if (!course) return false;
        return (
          (course?.title && course.title.toLowerCase().includes(searchLower)) ||
          (course?.description &&
            course.description.toLowerCase().includes(searchLower)) ||
          (course?.instructor &&
            course.instructor.toLowerCase().includes(searchLower)) ||
          (course?.category?.name &&
            course.category.name.toLowerCase().includes(searchLower))
        );
      });

      setSearchResults({
        courses: filtered,
        categories: [],
      });
    } catch (error) {
      console.error("Client-side search error:", error);
      // Only show error if it's not a 404
      if (error.response?.status !== 404) {
        toast.error("Error fetching courses. Please try again later.");
      }
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

    if (type === "course") {
      // Check if the course has a slug, otherwise use _id
      const courseId = item.slug || item._id;
      console.log("Navigating to course:", { courseId, item });
      if (courseId) {
        // Try both /course/:id and /courses/:id to see which one works
        const path = `/course/${courseId}`;
        console.log("Navigating to path:", path);
        navigate(path);
        resetSearch();
      }
    } else if (type === "category" && item._id) {
      console.log("Navigating to category:", item._id);
      navigate(`/courses/category/${item._id}`);
      resetSearch();
    }
  };

  // Reset search state
  const resetSearch = () => {
    setSearchQuery("");
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
        handleResultClick("course", searchResults.courses[0]);
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
        // Don't close search if clicking on the search icon
        if (!event.target.closest(".search-icon-container")) {
          setIsSearchOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus the search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle scroll effect
  const handleScroll = useCallback(() => {
    const navbar = document.getElementById("main-navbar");
    if (!navbar) return;

    if (window.scrollY > 10) {
      navbar.classList.add(
        "shadow-lg",
        "bg-white/80",
        "dark:bg-gray-800/80",
        "backdrop-blur-sm"
      );
      navbar.classList.remove("bg-white", "dark:bg-gray-900");
    } else {
      navbar.classList.remove(
        "shadow-lg",
        "bg-white/80",
        "dark:bg-gray-800/80",
        "backdrop-blur-sm"
      );
      navbar.classList.add("bg-white", "dark:bg-gray-900");
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const navbar = document.getElementById("main-navbar");
    if (!navbar) return;

    // Initial check
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Navigation items
  const navItems = [
    // { to: "/", label: "Home" },
    { to: "/free-courses", label: "Free Courses" },
    { to: "/lms", lmscolors: true },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const renderNavItems = (className = "") => (
    <div className="flex items-center">
      {/* Home */}
      <Link
        to="/"
        className={`px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
          false
            ? "text-black dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/30"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
        } ${className}`}
      >
        Home
      </Link>

      {/* Course Menu */}
      <CourseMenu className={className} />

      {/* Other navigation items */}
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
            item.lmscolors
              ? "text-black dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/30"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          } ${className}`}
        >
          {item.lmscolors && (
            <span className="px-1 py-1 font-bold text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-200 dark:bg-blue-900/30 rounded hover:bg-blue-300 dark:hover:bg-blue-900/30">
              SMART <span className=" text-orange-500">Board</span>
            </span>
          )}
          {item.label}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {/* Nabvar */}
      <div
        className="z-50 transition-all duration-300 bg-white dark:bg-gray-900 h-16 sticky top-0 left-0 right-0"
        id="main-navbar"
      >
        {/* Desktop Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                <span className="sr-only">Open main menu</span>
                <FaBars
                  className={`block h-6 w-6 ${
                    isMobileMenuOpen ? "hidden" : "block"
                  }`}
                  aria-hidden="true"
                />
                <FaTimes
                  className={`h-6 w-6 ${isMobileMenuOpen ? "block" : "hidden"}`}
                  aria-hidden="true"
                />
              </button>
              <div className="flex-shrink-0">
                <Link
                  to="/"
                  className="text-lg font-bold text-blue-600 dark:text-blue-400"
                >
                  <span style={{ color: "#F47C26" }}>First</span>
                  <span style={{ color: "#1E90FF" }}>VITE</span>
                </Link>
              </div>

              {/* Desktop menu */}
              <div className="hidden md:flex md:items-center xl:ml-8 lg:ml-6">
                <div className="flex-shrink-0">{renderNavItems()}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(!isSearchOpen);
                      if (!isSearchOpen) {
                        setTimeout(() => {
                          searchInputRef.current?.focus();
                        }, 0);
                      }
                    }}
                    className="p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 search-icon-container"
                    aria-label="Search"
                  >
                    <FaSearch className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 ease-in-out transform ${
                    isSearchOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                  style={{ zIndex: 50 }}
                >
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => setShowResults(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setShowResults(false);
                            setIsSearchOpen(false);
                          }
                        }}
                        className="w-full px-4 py-2 pl-10 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Search courses..."
                        aria-label="Search courses"
                        autoComplete="on"
                      />
                      <FaSearch className="absolute left-3 top-3 text-gray-400" />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults({ courses: [], categories: [] });
                            searchInputRef.current?.focus();
                          }}
                          className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          aria-label="Clear search"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Search Results */}
                    {showResults && searchQuery.trim() && (
                      <div className="mt-1 bg-white dark:bg-gray-800 rounded-b-lg shadow-lg border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
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
                                    onClick={() => {
                                      handleResultClick("course", course);
                                      setIsSearchOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center"
                                  >
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {course.title}
                                      </div>
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
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <FaSun className="w-4 h-4 p-0 m-0" />
                ) : (
                  <FaMoon className="w-4 h-4 p-0 m-0" />
                )}
              </button>

              {/* Payment Button */}
              <a
                href="https://genlead.in/agent/register"
                className="flex hidden lg:block items-center flex-col px-1 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Agent Register
              </a>

              {/* Payment Dropdown */}
              <div className="relative hidden lg:block md:block">
                <button
                  className="flex items-center px-1 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                  data-payment-button="true"
                >
                  Pay Now
                  <svg
                    className="w-3 h-3"
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
                {showPaymentDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 z-10 w-64 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <button
                        onClick={handlePaymentClick}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                        role="menuitem"
                      >
                        <span>
                          Pay Using{" "}
                          <span className="text-orange-600">RazorPay</span>
                        </span>
                        <svg
                          className="w-4 h-4 ml-2 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </button>
                    </div>
                    {/* <div className="px-3 py-2 border-b border-gray-100">
                      <button
                        className="flex flex-col justify-between w-full px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                        role="menuitem"
                      >
                        <span>Pay with QR Code</span>
                        <img src="" alt="QR Code" className="w-12 h-12" />
                      </button>
                    </div> */}

                    {/*    
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="space-y-2 p-4">
                        <h3 className="font-medium text-blue-600 mb-3">
                          Pay Using{" "}
                          <span className="text-orange-600">Bank Transfer</span>
                        </h3>
                        <div className="space-y-2">
                          {[
                            {
                              label: "Branch",
                              value: "ICICI Bank, Noida Sector 61",
                            },
                            {
                              label: "Account  Name",
                              value: "FirstVITE e learning Pvt Ltd.",
                            },
                            { label: "Account Number", value: "025305010216" },
                            { label: "IFSC Code", value: "ICIC0000253" },
                          ].map((item, index) => (
                            <div key={index} className="group relative">
                              <div className="flex flex-col justify-between">
                                <span className="text-sm font-medium text-black w-full">
                                  {item.label}:
                                </span>
                                <div className="flex items-center">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.value);
                                      setCopiedIndex(index);
                                      setTimeout(() => {
                                        setCopiedIndex(null);
                                      }, 2000);
                                    }}
                                    className="pe-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                    title={`Copy ${item.label}`}
                                  >
                                    {copiedIndex === index ? (
                                      <FaCheck className="text-green-500" />
                                    ) : (
                                      <FaCopy />
                                    )}
                                  </button>
                                  <span className="text-xs text-black font-mono">
                                    {item.value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    */}
                  </div>
                )}
              </div>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center focus:outline-none"
                    onClick={toggleProfileMenu}
                    aria-label="User menu"
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <FaUser className="text-gray-600 dark:text-gray-300" />
                    </div>
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      id="user-menu"
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <Link
                        to="/my-learning"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Learning
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      {/* LMS Approved or Not */}
                      {!isApproved && (
                        <div className="px-4 py-2 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                          <FaExclamationCircle />
                          LMS Not Approved
                        </div>
                      )}
                      {isApproved && (
                        <div className="px-4 py-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <FaCheck />
                          LMS Approved
                        </div>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                          navigate("/");
                        }}
                        className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="flex items-center px-1 py-1 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FaSignInAlt className="mr-0.5" />
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`mobile-menu-container md:hidden fixed inset-0 top-16 bg-white dark:bg-gray-900 shadow-lg z-40 overflow-y-auto transition-all duration-300 ease-in-out transform ${
            isMobileMenuOpen
              ? "translate-x-0 opacity-100 visible"
              : "-translate-x-full opacity-0 invisible"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 px-4 py-3 space-y-1">
              {/* Home */}
              <Link
                to="/"
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                  location.pathname === "/"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
                onClick={toggleMobileMenu}
              >
                Home
              </Link>

              {/* Bottom Action Buttons */}
              <div className="pt-1 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {/* SMART Board */}
                <Link
                  to="/lms"
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === "/"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                  onClick={toggleMobileMenu}
                >
                  SMART <span className=" text-orange-500">Board</span>
                </Link>

                {/* Movile Payment menu */}
                <button
                  className={`block px-4 flex items-center w-full py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === "/"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                  data-payment-button="true"
                >
                  Pay Now
                  <svg
                    className="w-3 h-3"
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
                {showPaymentDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute  left-0 z-50 w-64 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <button
                        onClick={handlePaymentClick}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                        role="menuitem"
                      >
                        <span>
                          Pay Using{" "}
                          <span className="text-orange-600">RazorPay</span>
                        </span>
                        <svg
                          className="w-4 h-4 ml-2 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* 
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="space-y-2 p-4">
                        <h3 className="font-medium text-blue-600 mb-3">
                          Pay Using{" "}
                          <span className="text-orange-600">Bank Transfer</span>
                        </h3>
                        <div className="space-y-2">
                          {[
                            {
                              label: "Branch",
                              value: "ICICI Bank, Noida Sector 61",
                            },
                            {
                              label: "Account  Name",
                              value: "FirstVITE e learning Pvt Ltd.",
                            },
                            { label: "Account Number", value: "025305010216" },
                            { label: "IFSC Code", value: "ICIC0000253" },
                          ].map((item, index) => (
                            <div key={index} className="group relative">
                              <div className="flex flex-col justify-between">
                                <span className="text-sm font-medium text-black w-full">
                                  {item.label}:
                                </span>
                                <div className="flex items-center">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.value);
                                      setCopiedIndex(index);
                                      setTimeout(() => {
                                        setCopiedIndex(null);
                                      }, 2000);
                                    }}
                                    className="pe-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                    title={`Copy ${item.label}`}
                                  >
                                    {copiedIndex === index ? (
                                      <FaCheck className="text-green-500" />
                                    ) : (
                                      <FaCopy />
                                    )}
                                  </button>
                                  <span className="text-xs text-black font-mono">
                                    {item.value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    */}
                  </div>
                )}

                {/* Genlead Agent Register */}
                <a
                  href="https://genlead.in/agent/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-1.5 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                  onClick={toggleMobileMenu}
                >
                  Agent Register
                </a>
              </div>

              {/* Course Menu - Mobile Version */}
              <div className="mobile-course-menu">
                <CourseMenu isMobile={true} onItemClick={toggleMobileMenu} />
              </div>

              {/* Other Navigation Items */}
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === item.to
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                  onClick={toggleMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50">
            <PaymentForm onClose={() => setShowPaymentForm(false)} />
          </div>
        )}
      </div>
    </>
  );
}

export default Navbar;
