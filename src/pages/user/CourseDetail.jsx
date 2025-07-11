import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { getCourseById } from "../../api/courseApi";
import { submitContactForm } from "../../api/contactApi";
import { enrollInCourse } from "../../api/enrollmentApi";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthProvider";
import {
  FaStar,
  FaUsers,
  FaClock,
  FaPlay,
  FaShare,
  FaBook,
  FaCertificate,
  FaMoneyBillWave,
  FaGlobe,
  FaCheck,
  FaFileAlt,
  FaUserTie,
  FaGraduationCap,
  FaTag,
  FaMobileAlt,
  FaListOl,
  FaQuestionCircle,
  FaPen,
  FaBookOpen,
  FaBriefcase,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaTimes,
  FaShoppingCart,
  FaHeart,
  FaBookmark,
  FaInfinity,
} from "react-icons/fa";
import {
  FaMessage as MessageSquare,
  FaCreditCard as CreditCard,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { formatDuration, formatPrice } from "../../utils/format";
import { getImageUrl } from "../../utils/imageUtils";
import { useCart } from "../../contexts/CartContext";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // State declarations - all hooks at the top
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSection, setActiveSection] = useState(null);
  const [showCheckoutOptions, setShowCheckoutOptions] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    courseInterests: [],
  });

  // Authentication effect
  useEffect(() => {
    if (!isAuthenticated) {
      const returnUrl = window.location.pathname + window.location.search;
      localStorage.setItem("returnUrl", returnUrl);
      navigate("/login", { state: { from: returnUrl }, replace: true });
      return; // Exit early if not authenticated
    }
  }, [isAuthenticated, navigate]);

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await getCourseById(id);
        if (response.success && response.data) {
          setCourse(response.data);
        } else {
          throw new Error(response.message || "Failed to load course");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error(error.message || "Failed to load course details");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Course Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The course you're looking for doesn't exist or may have been
            removed.
          </p>
          <div className="space-y-3">
            <Link
              to="/courses"
              className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Courses
            </Link>
            <Link
              to="/"
              className="inline-block w-full px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate discount percentage if original price is available
  const discountPercentage =
    course.originalPrice > course.price
      ? Math.round(
          ((course.originalPrice - course.price) / course.originalPrice) * 100
        )
      : 0;

  const handleContactTeam = () => {
    setShowCheckoutOptions(false);
    // Small delay for smooth transition
    setTimeout(() => setShowContactForm(true), 50);
  };

  const handleProceedToPayment = () => {
    // Implement direct enrollment/payment flow
    navigate(`/checkout?courseId=${course._id}`);
  };

  const handleEnroll = async () => {
    try {
      const enrollmentResponse = await enrollInCourse(course._id);
      if (enrollmentResponse.success) {
        toast.success(
          "You have been enrolled in this course with pending status. Our team will contact you shortly.",
          {
            style: {
              background: "#4caf50",
              color: "white",
            },
            duration: 5000,
          }
        );
      } else {
        console.warn("Enrollment warning:", enrollmentResponse.message);
      }
    } catch (enrollError) {
      console.error("Error in enrollment process:", enrollError);
    }
  };

  /**
   * Handle contact form submission for course enrollment
   * @param {Event} e - Form submit event
   */
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name?.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.email?.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.phone?.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!/^[\d\s\-+()]*$/.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the enrollment data
      const enrollmentData = {
        courseId: course._id,
        courseTitle: course.title,
        status: "pending",
        contactInfo: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message:
            formData.message?.trim() ||
            `I would like to enroll in ${course?.title}`,
        },
      };

      console.log("Submitting enrollment with data:", enrollmentData);

      // Submit the enrollment with contact info
      const response = await axios.post("/api/enrollments", enrollmentData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        toast.success(
          "Your enrollment request has been submitted successfully! Our team will contact you shortly.",
          {
            duration: 5000,
            style: {
              background: "#4caf50",
              color: "white",
            },
          }
        );

        // Reset form and close modal
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          courseInterests: [],
        });

        setShowContactForm(false);

        // Refresh the page to update the UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(response.data.message || "Failed to submit enrollment");
      }
    } catch (error) {
      console.error("Error submitting enrollment:", error);

      // Handle specific error cases
      if (error.response?.status === 429) {
        // Rate limiting error
        toast.error(
          "You have submitted too many requests. Please try again later.",
          {
            duration: 8000,
            icon: "⏱️",
          }
        );
      } else if (!navigator.onLine) {
        // Offline error
        toast.error(
          "You are offline. Please check your internet connection and try again.",
          {
            duration: 8000,
            icon: "🌐",
          }
        );
      } else if (error.response?.data?.errors) {
        // Handle validation errors from the server
        const errorMessages = error.response.data.errors;

        // If it's an array of error messages
        if (Array.isArray(errorMessages)) {
          errorMessages.forEach((msg) => {
            toast.error(msg, {
              style: {
                background: "#f44336",
                color: "white",
              },
              duration: 5000,
            });
          });
        }
        // If it's an object with field-specific errors
        else if (typeof errorMessages === "object") {
          Object.values(errorMessages).forEach((messages) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg) => {
                toast.error(msg, {
                  style: {
                    background: "#f44336",
                    color: "white",
                  },
                  duration: 5000,
                });
              });
            }
          });
        }
      } else {
        // Show generic error message
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred. Please try again.";

        toast.error(errorMessage, {
          style: {
            background: "#f44336",
            color: "white",
          },
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("Input changed:", { name, value, type });

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log("New form data:", newData);
      return newData;
    });
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Expand all sections
  const expandAllSections = () => {
    const allExpanded = {};
    course.curriculum?.forEach((section, index) => {
      allExpanded[index] = true;
    });
    setExpandedSections(allExpanded);
  };

  // Collapse all sections
  const collapseAllSections = () => {
    setExpandedSections({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Course Header */}
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex overflow-x-auto py-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm">
              <li className="flex items-center">
                <Link
                  to="/"
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link
                  to="/courses"
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px] md:max-w-md">
                  {course.title}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="">
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Course Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6 lg:w-2/3">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {course.category?.name && (
                  <Link
                    to={`/courses/category/${
                      course.category.slug || course.category._id
                    }`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <FaTag className="mr-1.5 h-3 w-3" />
                    {course.category.name}
                  </Link>
                )}
                {course.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <FaStar className="mr-1.5 h-3 w-3" />
                    Featured
                  </span>
                )}
                {course.level && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {course.level}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  {course.title}
                </h1>

                <div className="flex items-center">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="w-5 h-5" />
                    ))}
                    <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
                      {course.rating?.toFixed(1) || "4"}
                      <span className="text-gray-500 font-normal">
                        {" "}
                        ({course.reviews?.length || 18} ratings)
                      </span>
                    </span>
                  </div>
                  <span className="mx-3 text-gray-300 dark:text-gray-600">
                    •
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {course.enrolledStudents?.toLocaleString() || "500+"}{" "}
                    students
                  </span>
                </div>

                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {course.shortDescription ||
                    course.description
                      ?.replace(/<[^>]*>?/gm, "")
                      .substring(0, 200)}
                  <button className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                    Read more
                  </button>
                </p>
              </div>

              {/* Course Meta */}
              <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b border-gray-100 dark:border-gray-700 my-6">
                <div className="flex items-center text-sm">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <FaClock className="w-4 h-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Duration
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {course.duration || "Lifetime"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

                <div className="flex items-center text-sm">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <FaBookOpen className="w-4 h-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Lessons
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {course.lessonsCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

                <div className="flex items-center text-sm">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      <FaCertificate className="w-4 h-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Certificate
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Included
                      </p>
                    </div>
                  </div>
                </div>

                {course.language && (
                  <>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <FaGlobe className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Language
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {course.language}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Course Description */}
              <div className="prose prose-gray max-w-none dark:prose-invert mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {course.shortDescription || "No description available."}
                </p>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <FaClock className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Duration
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {course.duration || "Lifetime"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      <FaBookOpen className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Lessons
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {course.lessonsCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <FaCertificate className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Certificate
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Yes
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                      <FaMobileAlt className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Access
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Any device
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
                  onClick={() => setShowCheckoutOptions(true)}
                >
                  <FaPlay className="mr-2" /> Enroll Now
                </button>
                <button
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium flex items-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: course.title,
                          text: `Check out this course: ${course.title}`,
                          url: window.location.href,
                        })
                        .catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                >
                  <FaShare className="mr-2" /> Share
                </button>
                {course.previewVideo && (
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center">
                    <FaPlay className="mr-2" /> Preview this course
                  </button>
                )}
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:sticky lg:top-6 lg:w-1/3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl">
                <div className="relative group">
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                    <img
                      src={getImageUrl(course.thumbnail)}
                      alt={course.title}
                      className="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/course-placeholder.jpg";
                      }}
                    />
                  </div>

                  {course.previewVideo && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pb-4 justify-center">
                      <button
                        className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-full font-medium transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300 hover:bg-blue-50"
                        onClick={() => {
                          console.log("Open preview video");
                        }}
                      >
                        <FaPlay className="mr-2" />
                        Watch Preview
                      </button>
                    </div>
                  )}

                  {discountPercentage > 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {discountPercentage}% OFF
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {course.price > 0
                            ? formatPrice(course.price)
                            : "Free"}
                        </span>
                        {course.originalPrice > course.price && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatPrice(course.originalPrice)}
                          </span>
                        )}
                      </div>

                      {course.certificateIncluded && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <FaCertificate className="mr-1.5 w-4 h-4" />
                          Certificate Included
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          addToCart({
                            id: course._id,
                            title: course.title,
                            price: course.price,
                            thumbnail: course.thumbnail,
                            instructor: course.instructor?.name,
                            rating: course.rating,
                            students: course.studentsCount,
                          });
                          setShowCheckoutOptions(true);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                      >
                        <FaShoppingCart className="mr-2" />
                        Enroll Now
                      </button>

                      <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center">
                        <FaHeart className="mr-2 text-red-500" />
                        Add to Wishlist
                      </button>

                      <div className="flex items-center justify-center space-x-4 pt-2">
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator
                                .share({
                                  title: course.title,
                                  text: `Check out this course: ${course.title}`,
                                  url: window.location.href,
                                })
                                .catch(console.error);
                            } else {
                              navigator.clipboard.writeText(
                                window.location.href
                              );
                              toast.success("Link copied to clipboard!");
                            }
                          }}
                          className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                          aria-label="Share course"
                        >
                          <FaShare className="w-5 h-5" />
                        </button>

                        <button
                          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                          aria-label="Add to favorites"
                        >
                          <FaHeart className="w-5 h-5" />
                        </button>

                        <button
                          className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                          aria-label="Save for later"
                        >
                          <FaBookmark className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        This course includes:
                      </h3>
                      <ul className="space-y-3">
                        {[
                          {
                            icon: (
                              <FaPlay className="text-blue-500 w-5 h-5 flex-shrink-0" />
                            ),
                            text: `${
                              course.totalHours || 0
                            } hours on-demand video`,
                          },
                          {
                            icon: (
                              <FaFileAlt className="text-purple-500 w-5 h-5 flex-shrink-0" />
                            ),
                            text: "Downloadable resources",
                          },
                          {
                            icon: (
                              <FaMobileAlt className="text-green-500 w-5 h-5 flex-shrink-0" />
                            ),
                            text: "Access on mobile and TV",
                          },
                          {
                            icon: (
                              <FaInfinity className="text-amber-500 w-5 h-5 flex-shrink-0" />
                            ),
                            text: "Full lifetime access",
                          },
                          {
                            icon: (
                              <FaCertificate className="text-red-500 w-5 h-5 flex-shrink-0" />
                            ),
                            text: "Certificate of completion",
                          },
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mt-0.5">{item.icon}</span>
                            <span className="ml-3 text-gray-600 dark:text-gray-300">
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          30-Day Money-Back Guarantee
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Full Lifetime Access. Cancel anytime.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    This course includes:
                  </h3>
                  <ul className="space-y-2">
                    {[
                      {
                        icon: <FaPlay className="text-green-500 mr-2" />,
                        text: `${course.totalHours || 0} hours on-demand video`,
                      },
                      {
                        icon: <FaFileAlt className="text-blue-500 mr-2" />,
                        text: "Downloadable resources",
                      },
                      {
                        icon: <FaUserTie className="text-purple-500 mr-2" />,
                        text: "Instructor support",
                      },
                      {
                        icon: (
                          <FaGraduationCap className="text-yellow-500 mr-2" />
                        ),
                        text: "Certificate of completion",
                      },
                      {
                        icon: <FaMobileAlt className="text-red-500 mr-2" />,
                        text: "Access on mobile and TV",
                      },
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                      >
                        {item.icon}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
          <nav className="flex -mb-px whitespace-nowrap space-x-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "curriculum"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab("instructor")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "instructor"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Instructor
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Reviews
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {activeTab === "overview" && (
            <div className="prose max-w-none dark:prose-invert">
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <p className="mb-6">
                {course.description
                  ?.replace(/^<p>/i, "")
                  .replace(/<\/p>$/i, "")}
              </p>

              <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {course.whatYouWillLearn?.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{item}</span>
                  </div>
                )) || <p>No learning objectives specified.</p>}
              </div>

              <h3 className="text-xl font-semibold mb-4">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 mb-8">
                {course.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                )) || <li>No specific requirements</li>}
              </ul>

              <h3 className="text-xl font-semibold mb-4">
                Who is this course for?
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                {course.whoIsThisFor?.map((item, index) => (
                  <li key={index}>{item}</li>
                )) || <li>Anyone interested in learning about this topic</li>}
              </ul>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Course Content</h2>
                <div className="flex space-x-2 mt-3 sm:mt-0">
                  <button
                    onClick={expandAllSections}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAllSections}
                    className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {course.curriculum?.length > 0 ? (
                  <div className="space-y-3">
                    {course.curriculum.map((section, sectionIndex) => (
                      <div
                        key={sectionIndex}
                        className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-200"
                      >
                        <div
                          className={`px-5 py-4 font-medium flex justify-between items-center cursor-pointer transition-colors ${
                            expandedSections[sectionIndex]
                              ? "bg-blue-50 dark:bg-slate-800/50"
                              : "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                          onClick={() => toggleSection(sectionIndex)}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-3 ${
                                expandedSections[sectionIndex]
                                  ? "bg-blue-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <h3 className="text-gray-900 dark:text-white font-semibold">
                              {section.title}
                            </h3>
                            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                              {section.lessons?.length || 0} lessons •{" "}
                              {section.duration || "0 min"}
                            </span>
                          </div>
                          <svg
                            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                              expandedSections[sectionIndex]
                                ? "transform rotate-180"
                                : ""
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
                        </div>
                        <AnimatePresence>
                          {expandedSections[sectionIndex] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-white dark:bg-slate-800 overflow-hidden"
                            >
                              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                {section.lessons?.map((lesson, lessonIndex) => (
                                  <div
                                    key={lessonIndex}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                                  >
                                    <div className="flex items-center">
                                      <FaPlay className="h-4 w-4 text-gray-400 mr-3" />
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {lesson.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                      <span className="mr-4">
                                        {lesson.duration || "5 min"}
                                      </span>
                                      <FaLock className="h-4 w-4 text-gray-400" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaBookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                      No curriculum available
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      The course curriculum will be available soon.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "instructor" && (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                  <div className="flex flex-col items-center">
                    <img
                      src={
                        course.instructor?.avatar ||
                        "/images/avatar-placeholder.png"
                      }
                      alt={course.instructor?.name || "Instructor"}
                      className="h-24 w-24 rounded-full mb-4 object-cover"
                    />
                    <h3 className="text-xl font-bold">
                      {course.instructor?.name || "Instructor Name"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {course.instructor?.title || "Course Instructor"}
                    </p>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-blue-500">
                        <span className="sr-only">Twitter</span>
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-blue-700">
                        <span className="sr-only">LinkedIn</span>
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Total Students
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        10,000+
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Courses
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">15+</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Reviews
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">4,500+</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-2xl font-bold mb-4">
                  About the Instructor
                </h3>
                <div className="prose max-w-none dark:prose-invert">
                  <p className="mb-4">
                    {course.instructor?.bio ||
                      "No biography available for this instructor."}
                  </p>
                  <p>
                    With years of experience in the field, our instructor is
                    dedicated to providing high-quality education and helping
                    students achieve their learning goals. Their teaching
                    approach focuses on practical, real-world applications to
                    ensure you gain the skills you need to succeed.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-8 mb-4">
                  Other Courses by This Instructor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="h-40 bg-gray-200 dark:bg-slate-700"></div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Course Title {item}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                          Brief description of the course content and what
                          students will learn.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            View Course
                          </span>
                          <span className="text-sm text-gray-500">
                            ${item * 20 + 29}.99
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <p className="text-lg font-bold">Student Feedback</p>
                  <div className="flex flex-wrap items-center mt-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(course.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">
                      {course.rating?.toFixed(1) || "No"} rating •{" "}
                      {course.reviews?.length || 0} reviews
                    </span>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium self-start sm:self-auto">
                  Write a Review
                </button>
              </div>

              {course.reviews?.length > 0 ? (
                <div className="space-y-6">
                  {course.reviews.map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700 pb-6"
                    >
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium mr-4">
                          {review.user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {review.user?.name || "Anonymous User"}
                              </h4>
                              <div className="flex items-center mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-2 text-sm text-gray-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-600 dark:text-gray-300">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No reviews yet. Be the first to review this course!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Options Modal */}
      <AnimatePresence>
        {showCheckoutOptions && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCheckoutOptions(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-6 text-center dark:text-white">
                Choose Enrollment Option
              </h3>

              <div className="space-y-4">
                <button
                  onClick={handleContactTeam}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Contact Our Team</span>
                </button>

                <button
                  // onClick={() => navigate(`/checkout?courseId=${id}`)}
                  disabled
                  className="cursor-not-allowed w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed with Payment</span>
                </button>
              </div>

              <button
                onClick={() => setShowCheckoutOptions(false)}
                className="mt-6 w-full py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <p className="text-lg font-bold dark:text-white">
                  Process Your Enrollment by Fill the Form
                </p>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  aria-label="Close"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                  <button
                    onClick={handleEnrollClick}
                    disabled={isEnrolling}
                    className={`w-full flex items-center justify-center px-6 py-3.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                      isEnrolling
                        ? "opacity-80 cursor-not-allowed"
                        : "shadow-md hover:shadow-lg"
                    }`}
                  >
                    {isEnrolling ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart className="mr-2" />
                        Enroll Now -{" "}
                        {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                      </>
                    )}
                  </button>
                  {course.hasDiscount && course.originalPrice && (
                    <div className="absolute -bottom-5 left-0 right-0 text-center">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium text-white bg-amber-500 rounded-full">
                        {Math.round(
                          (1 - course.price / course.originalPrice) * 100
                        )}
                        % OFF
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddToWishlist}
                    disabled={isWishlistLoading}
                    className={`flex items-center justify-center px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm ${
                      isWishlistLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    aria-label={
                      isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    {isWishlistLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </>
                    ) : isInWishlist ? (
                      <FaHeart className="h-5 w-5 text-red-500" />
                    ) : (
                      <FaRegHeart className="h-5 w-5" />
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={toggleShareMenu}
                      className="flex items-center justify-center w-12 h-12 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                      aria-label="Share course"
                      aria-expanded={showShareMenu}
                      aria-haspopup="true"
                    >
                      <FaShareAlt className="h-5 w-5" />
                    </button>

                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="share-menu"
                        >
                          <div className="py-1">
                            <button
                              onClick={handleShare("facebook")}
                              className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                              role="menuitem"
                            >
                              <FaFacebook className="mr-3 h-5 w-5 text-blue-600" />
                              Facebook
                            </button>
                            <button
                              onClick={handleShare("twitter")}
                              className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                              role="menuitem"
                            >
                              <FaTwitter className="mr-3 h-5 w-5 text-blue-400" />
                              Twitter
                            </button>
                            <button
                              onClick={handleShare("linkedin")}
                              className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                              role="menuitem"
                            >
                              <FaLinkedin className="mr-3 h-5 w-5 text-blue-700" />
                              LinkedIn
                            </button>
                            <button
                              onClick={handleCopyLink}
                              className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                              role="menuitem"
                            >
                              <FaLink className="mr-3 h-5 w-5 text-gray-500" />
                              Copy Link
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="+1 (123) 456-7890"
                  />
                </div>

                {course && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You're inquiring about: <strong>{course.title}</strong>
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetail;
