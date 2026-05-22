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
  FaCheck,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronRight,
  FaPhoneAlt,
  FaEnvelope,
  FaCreditCard,
} from "react-icons/fa";
import CourseMenu from "./CourseMenu";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import api from "../api/axios";
import PaymentForm from "./PaymentForm";

function Navbar() {
  const { currentUser, isAuthenticated, isAdmin, isApproved, logout } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const logoImg =
    "http://eklabya.com/api/upload/file/eKlabya-fit-logo-8874.png";
  // --- State ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    courses: [],
    categories: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light",
  );

  // --- Refs ---
  const searchContainerRef = useRef(null);
  const profileMenuRef = useRef(null);
  const paymentDropdownRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    const element = document.documentElement;
    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        paymentDropdownRef.current &&
        !paymentDropdownRef.current.contains(event.target)
      ) {
        setShowPaymentDropdown(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Search Logic ---
  const handleSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults({ courses: [], categories: [] });
        return;
      }
      setIsSearching(true);
      try {
        const response = await api.get("/courses", {
          params: { search: query, limit: 5 },
        });
        const courses = response?.data?.data || response?.data || [];
        setSearchResults({
          courses: Array.isArray(courses) ? courses : [],
          categories: [],
        });
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setIsSearching(false);
      }
    }, 400),
    [],
  );

  const onSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);
    handleSearch(query);
  };

  const navigateToCourse = (course) => {
    const courseId = course.slug || course._id;
    if (courseId) {
      navigate(`/course/${courseId}`);
      setShowResults(false);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setIsMobileSearchOpen(false);
    }
  };

  const navLinks = [
    { to: "/courses", label: "All Course" },
    { to: "/categories", label: "Categories" },
    // { to: "/free-course", label: "Free Courses" },
    { to: "/testimonials", label: "Testimonials" },
    { to: "/scholarship-test", label: "Scholarship" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="flex flex-col w-full sticky top-0 z-50 text-black dark:text-white">
      {/* ==================================================================
          PART 1: TOP BAR (Utilities)
          Hidden on mobile, visible on desktop. Dark background.
      ================================================================== */}
      <div className="bg-gray-900 text-gray-300 text-xs py-1 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left Side: Contact / Info */}
          <div className="hidden md:inline-flex items-center gap-4">
            <a
              href="mailto:info@eklabya.com"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <FaEnvelope size={10} /> Mail Us
            </a>
            <a
              href="tel:+919891030303"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <FaPhoneAlt size={10} /> +91 9891030303
            </a>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-4">
            <a
              href="mailto:info@eklabya.com"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <FaEnvelope size={10} />
            </a>
            <a
              href="tel:+919891030303"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <FaPhoneAlt size={10} />
            </a>
          </div>

          {/* Right Side: Actions (Theme, Pay, Agent, Auth) */}
          <div className="hidden md:inline-flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {theme === "dark" ? <FaSun size={12} /> : <FaMoon size={12} />}
              <span>{theme === "dark" ? "" : ""}</span>
            </button>

            <div className="h-3 w-px bg-gray-700 mx-1"></div>

            {/* Agent Register */}
            <a
              href="https://genlead.in/agent/register"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Agent Register
            </a>

            <div className="h-3 w-px bg-gray-700 mx-1"></div>

            {/* SMART Board */}
            <Link
              to="/smart-board"
              target="_blank"
              className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              SMART Board
            </Link>

            {/* Payment Dropdown (Small Version) */}
            <div className="relative" ref={paymentDropdownRef}>
              <button
                onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <FaCreditCard size={12} /> Make Payment{" "}
                <FaChevronDown size={8} />
              </button>
              {showPaymentDropdown && (
                <div className="absolute right-0 top-6 w-80 bg-white text-gray-800 rounded shadow-xl border border-gray-100 z-50">
                  <button
                    onClick={() => {
                      setShowPaymentForm(true);
                      setShowPaymentDropdown(false);
                    }}
                    className="text-left px-3 py-2 bg-blue-200 rounded m-4 text-lg hover:bg-blue-50 flex items-center justify-between"
                  >
                    <span>
                      Pay Using{" "}
                      <span className="text-orange-600">RazorPay</span>
                    </span>
                  </button>

                  <div className="bg-white border-t border-gray-200 px-6 py-2 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">
                      Pay Using Bank Transfer
                    </h2>

                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between border-y py-2">
                        <span className="font-medium">Bank Name</span>
                        <strong>ICICI Bank</strong>
                      </div>

                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Account Number</span>
                        <strong>2530 5010 216</strong>
                      </div>

                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">IFSC Code</span>
                        <strong>ICIC0000253</strong>
                      </div>

                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Branch</span>
                        <strong>Noida</strong>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium">UPI Number</span>
                        <strong>9891030303</strong>
                      </div>
                    </div>

                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-xl p-2">
                      <p className="text-sm text-yellow-700">
                        After payment, please share your transaction ID or
                        payment screenshot for verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-3 w-px bg-gray-700 mx-1"></div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 hover:text-white font-semibold"
                >
                  <FaUser size={10} />
                  {currentUser?.name?.split(" ")[0] || "My Account"}
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-2 text-sm text-gray-700 dark:text-gray-200 z-50 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                      <p className="font-semibold">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">
                        {currentUser?.email}
                      </p>
                    </div>
                    <Link
                      to="/my-learning"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      My Learning
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Profile Settings
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
              >
                <FaSignInAlt size={10} />Login
              </Link>
            )}
          </div>

          {/* mobile Right Side: Actions (Theme, Pay, Agent, Auth) */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {theme === "dark" ? <FaSun size={12} /> : <FaMoon size={12} />}
              <span>{theme === "dark" ? "" : ""}</span>
            </button>

            <div className="h-3 w-px bg-gray-700"></div>

            {/* Agent Register */}
            <a
              href="https://genlead.in/agent/register"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Agent Register
            </a>

            <div className="h-3 w-px bg-gray-700"></div>

            {/* Payment Dropdown (Small Version) */}
            <div className="relative" ref={paymentDropdownRef}>
              <button
                onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                Pay <FaChevronDown size={8} />
              </button>
              {showPaymentDropdown && (
                <div className="absolute right-[-20px] top-6 w-64 bg-white text-gray-800 rounded shadow-xl border border-gray-100 z-50">
                  <button
                    onClick={() => {
                      setShowPaymentForm(true);
                      setShowPaymentDropdown(false);
                    }}
                    className="text-left px-3 py-2 bg-blue-200 rounded m-4 text-lg hover:bg-blue-50 flex items-center justify-between"
                  >
                    <span>
                      Pay Using{" "}
                      <span className="text-orange-600">RazorPay</span>
                    </span>
                  </button>

                  <div className="bg-white border-t border-gray-200 px-6 py-2 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-800 mb-2">
                      Pay Using Bank & UPI
                    </h2>

                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between border-y py-2">
                        <span className="font-medium">Bank Name</span>
                        <strong>ICICI Bank</strong>
                      </div>

                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Account Number</span>
                        <strong>2530 5010 216</strong>
                      </div>

                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">IFSC Code</span>
                        <strong>ICIC0000253</strong>
                      </div>

                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Branch</span>
                        <strong>Noida</strong>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium">UPI Number</span>
                        <strong>9891030303</strong>
                      </div>
                    </div>

                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-xl p-2">
                      <p className="text-sm text-yellow-700">
                        After payment, please share your transaction ID or
                        payment screenshot for verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-3 w-px bg-gray-700 mx-1"></div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 hover:text-white font-semibold"
                >
                  <FaUser size={10} />
                  {currentUser?.name?.split(" ")[0] || ""}
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-2 text-sm text-gray-700 dark:text-gray-200 z-50 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                      <p className="font-semibold">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">
                        {currentUser?.email}
                      </p>
                    </div>
                    <Link
                      to="/my-learning"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      My Learning
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Profile Settings
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
              >
                <FaSignInAlt size={10} /> <span className="hidden md:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================
          PART 2: BOTTOM BAR (Main Navigation)
          White background, bigger height, contains Logo, Links, Search.
      ================================================================== */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 md:h-12 gap-2">
            {/* 1. Logo */}
            <div className="flex-shrink-0 flex items-center gap-1">
              {/* Mobile Toggle (Left of logo on mobile) */}
              <button
                className="md:hidden mr-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <FaTimes size={22} />
                ) : (
                  <FaBars size={22} />
                )}
              </button>
              <Link
                to="/"
                className="text-lg font-bold text-blue-600 dark:text-blue-400"
              >
                <img
                  src={logoImg}
                  alt="eklabya – Your Online Learning Partner"
                  className="h-10 rounded"
                />
              </Link>
            </div>

            {/* 2. Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <div className="relative group">
                <CourseMenu />
              </div>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-sm font-semibold transition-all duration-300 relative ${
                      link.isSpecial
                        ? isActive
                          ? "text-blue-700 bg-blue-100 px-3 py-1.5 rounded-md shadow-md transform scale-105"
                          : "text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md hover:shadow-md hover:scale-105"
                        : isActive
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    {link.label}
                    {!link.isSpecial && isActive && (
                      <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 transform scale-x-100 transition-transform duration-300"></span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* 3. Search Bar (Desktop) & Mobile Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop Search */}
              <div
                className="hidden lg:block relative w-52"
                ref={searchContainerRef}
              >
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="What do you want to learn?"
                    value={searchQuery}
                    onChange={onSearchChange}
                    onFocus={() => setShowResults(true)}
                    className="w-full pl-10 pr-4 py-1.5 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 rounded-full text-sm transition-all"
                  />
                  <FaSearch className="absolute left-3.5 top-2.5 text-gray-400" />
                </form>

                {/* Desktop Search Results */}
                {showResults && searchQuery && (
                  <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Searching...
                      </div>
                    ) : searchResults.courses.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Top Results
                        </div>
                        {searchResults.courses.map((course) => (
                          <button
                            key={course._id}
                            onClick={() => navigateToCourse(course)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 group"
                          >
                            <div className="bg-blue-100 p-2 rounded text-blue-600">
                              <FaSearch size={12} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600">
                                {course.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate w-60">
                                {course.category?.name || "General"}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-gray-500">
                        <p>No courses found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Search Icon */}
              <button
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              >
                <FaSearch size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Expandable Row) */}
        {isMobileSearchOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              <FaSearch className="absolute left-3.5 top-3.5 text-gray-400" />
            </form>
            {/* Mobile Results */}
            {showResults && searchResults.courses.length > 0 && (
              <div className="mt-2 rounded-lg border border-gray-100 dark:border-gray-700">
                {searchResults.courses.map((course) => (
                  <button
                    key={course._id}
                    onClick={() => navigateToCourse(course)}
                    className="w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-none text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900"
                  >
                    {course.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================
          MOBILE MENU OVERLAY
          Combines Top Bar and Bottom Bar items for mobile users
      ================================================================== */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[85%] max-w-[350px] bg-white dark:bg-gray-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-1 pb-5 px-3">
          {/* Mobile Header */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-xl font-bold">
              <span style={{ color: "#1E90FF" }}>e</span>
              <span style={{ color: "#F47C26" }}>KLABYA</span>
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-gray-500"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* User Info (Mobile) */}
          {isAuthenticated ? (
            <div className="mb-3 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-3">
              <div>
                <p className="font-bold text-sm">{currentUser?.fullname}</p>
                <p className="text-xs">{currentUser?.email}</p>
              </div>
            </div>
          ) : (
            <div className="mb-6 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Small Screen Payment option */}
          <div className="mb-1" ref={paymentDropdownRef}>
            <button
              onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FaCreditCard size={14} /> Make Payment
              </span>
              <FaChevronDown
                size={10}
                className={`transition-transform ${showPaymentDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showPaymentDropdown && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => {
                    setShowPaymentForm(true);
                    setShowPaymentDropdown(false);
                  }}
                  className="w-full text-left px-2 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Pay Using <span className="text-orange-600">RazorPay</span>
                  </span>
                  <FaChevronRight size={12} className="text-gray-400" />
                </button>

                <div className="px-2 py-3">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                    Pay Using Bank Transfer
                  </h3>

                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        Bank Name
                      </span>
                      <span className="font-medium">ICICI Bank</span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        Account Number
                      </span>
                      <span className="font-medium">2530 5010 216</span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        IFSC Code
                      </span>
                      <span className="font-medium">ICIC0000253</span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        Branch
                      </span>
                      <span className="font-medium">Noida</span>
                    </div>

                    <div className="flex justify-between py-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        UPI Number
                      </span>
                      <span className="font-medium">9891030303</span>
                    </div>
                  </div>

                  <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      After payment, please share your transaction ID or payment
                      screenshot for verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 mb-6">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 font-medium bg-gray-200 dark:bg-gray-800 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              Home
            </Link>
            <div className="">
              <CourseMenu
                isMobile={true}
                onItemClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center font-medium rounded-lg bg-gray-200 dark:bg-gray-800 px-2 py-2 ${
                  link.isSpecial
                    ? "text-blue-600 bg-blue-50"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
                <Link
                  to="/my-learning"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 bg-gray-200 dark:bg-gray-800 font-medium hover:bg-gray-50 rounded-lg"
                >
                  My Learning
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 bg-gray-200 dark:bg-gray-800 font-medium hover:bg-gray-50 rounded-lg"
                >
                  My Profile
                </Link>
                <a
                  href="https://genlead.in/agent/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 bg-gray-200 dark:bg-gray-800 font-medium hover:bg-gray-50 rounded-lg"
                >
                  Agent Register
                </a>
              </>
            )}
          </div>

          {/* Mobile Footer Actions (From Top Bar) */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
            {isAuthenticated && (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                  navigate("/");
                }}
                className="flex items-center gap-3 text-red-600 font-medium text-sm w-full"
              >
                <FaSignInAlt className="rotate-180" /> Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <PaymentForm onClose={() => setShowPaymentForm(false)} />
        </div>
      )}
    </div>
  );
}

export default Navbar;
