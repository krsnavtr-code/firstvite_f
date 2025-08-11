import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import SEO from "../../components/SEO";
import axios from "axios";
import { getCourseById } from "../../api/courseApi";
import { submitContactForm } from "../../api/contactApi";
import { enrollInCourse } from "../../api/enrollmentApi";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaStar,
  FaClock,
  FaPlay,
  FaShare,
  FaCertificate,
  FaGlobe,
  FaFileAlt,
  FaTag,
  FaMobileAlt,
  FaBookOpen,
  FaTimes,
  FaShoppingCart,
  FaRegStar,
  FaArrowRight,
  FaCalendar,
} from "react-icons/fa";
import {
  FaMessage as MessageSquare,
  FaCreditCard as CreditCard,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { formatDuration, formatPrice } from "../../utils/format";
import { getImageUrl } from "../../utils/imageUtils";
import { useCart } from "../../contexts/CartContext";
import PaymentForm from "../../components/PaymentForm";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // Get current user from auth context
  const { currentUser } = useAuth();

  // State declarations - all hooks at the top
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSection, setActiveSection] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showCheckoutOptions, setShowCheckoutOptions] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showCertificate, setShowCertificate] = useState(false);

  // Initialize expanded sections when course data is loaded
  useEffect(() => {
    if (course?.curriculum?.length > 0) {
      const initialExpandedState = course.curriculum.reduce(
        (acc, _, index) => ({
          ...acc,
          [index]: true,
        }),
        {}
      );
      setExpandedSections(initialExpandedState);
    }
  }, [course]);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    message: "",
    courseInterests: [],
  });

  // Auto-fill user data when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
      }));
    }
  }, [currentUser]);

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
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Course Not Found
          </h2>
          <p className="text-black dark:text-gray-300 mb-6">
            The course you're looking for doesn't exist or may have been
            removed.
          </p>
          <div className="space-y-3">
            <Link
              to="/courses"
              className="inline-block w-full px-6 py-3 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Courses
            </Link>
            <Link
              to="/"
              className="inline-block w-full px-6 py-3 bg-gray-100 dark:bg-slate-700 text-black dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
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
    if (!isAuthenticated) {
      // If user is not authenticated, redirect to login
      navigate("/login", { state: { from: `/courses/${course._id}` } });
      return;
    }

    setIsSubmitting(true);
    try {
      const enrollmentResponse = await enrollInCourse(course._id);

      if (enrollmentResponse.success) {
        toast.success(
          "Your enrollment request has been received. Our team will contact you shortly.",
          {
            style: {
              background: "#4caf50",
              color: "white",
            },
            duration: 5000,
          }
        );
        // Close the form after successful submission
        setShowContactForm(false);
      } else {
        // Handle specific error cases
        if (enrollmentResponse.shouldLogout) {
          // If token is invalid, redirect to login
          toast.error("Your session has expired. Please log in again.");
          // The AuthContext will handle the logout
        } else {
          // Show error message to user
          toast.error(
            enrollmentResponse.message ||
              "Failed to process enrollment. Please try again."
          );
        }
      }
    } catch (enrollError) {
      console.error("Error in enrollment process:", enrollError);
      toast.error(
        "An error occurred while processing your request. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
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

        // Trigger brochure download
        console.log("Checking for brochure download...");
        console.log("Course brochure URL:", course.brochureUrl);

        if (course.brochureUrl) {
          console.log("Brochure URL found, initiating download...");
          // Give the browser a moment to process the form submission
          setTimeout(() => {
            try {
              downloadBrochure();
            } catch (error) {
              console.error("Error in brochure download:", error);
            }
          }, 1000);
        } else {
          console.log("No brochure URL found for this course");
        }

        // Close the form
        setShowContactForm(false);
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

  // Function to handle brochure download
  const downloadBrochure = async () => {
    try {
      if (!course?._id) {
        toast.error("Course information is not available");
        return;
      }

      // Show loading state
      const toastId = toast.loading("Preparing brochure download...");

      try {
        // Make API call to download brochure (no auth required)
        const response = await axios.get(
          `/api/courses/${course._id}/download-brochure`,
          {
            responseType: "blob", // Important for file downloads
          }
        );

        // Create a blob from the response
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Brochure-${course.title
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase()}.pdf`
        );

        // Append to body, click and remove
        document.body.appendChild(link);
        link.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        toast.success("Brochure download started", { id: toastId });
      } catch (error) {
        console.error("Error downloading brochure:", error);

        // Handle specific error cases
        if (error.response?.status === 404) {
          toast.error("Brochure not available for this course", {
            id: toastId,
          });
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message, { id: toastId });
        } else {
          toast.error("Failed to download brochure. Please try again.", {
            id: toastId,
          });
        }
      }
    } catch (error) {
      console.error("Error in downloadBrochure:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("Input changed:", { name, value, type });

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const rating = course.rating || 4;

  const CertificateModal = ({ isOpen, onClose }) => {
    // Prevent right-click context menu
    useEffect(() => {
      const handleContextMenu = (e) => {
        if (isOpen) {
          e.preventDefault();
        }
      };

      document.addEventListener("contextmenu", handleContextMenu);
      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-[550px] w-full max-h-[550px] overflow-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white z-20"
          >
            <FaTimes className="text-2xl" />
          </button>
          <div className="p-6 relative">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Simple Certificate
            </h3>
            {/* Image Container with Protection */}
            <div className="relative">
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)",
                  mixBlendMode: "multiply",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-2xl font-bold text-gray-400 opacity-30 transform -rotate-45 select-none">
                  SAMPLE CERTIFICATE
                </div>
              </div>
              <div className="relative">
                {/* This is a decoy element that will appear in dev tools */}
                <div
                  className="hidden"
                  data-decoysrc="ignore-this-decoysrc"
                  style={{ display: "none" }}
                >
                  <img
                    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                    alt=""
                  />
                </div>

                {/* Actual image with obfuscated attributes */}
                <div
                  className="certificate-image-container"
                  style={{
                    backgroundImage:
                      "url('http://firstvite.com/api/upload/file/img-1754374737042-580116956.jpg')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    width: "100%",
                    aspectRatio: "4/3",
                    filter: "blur(1px)",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    userSelect: "none",
                    pointerEvents: "none",
                    WebkitTouchCallout: "none",
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                />

                {/* Add some noise to make screenshotting harder */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
                    pointerEvents: "none",
                    mixBlendMode: "overlay",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Generate SEO metadata
  const seoTitle = course ? `${course.title} | FirstVITE` : 'Course Details | FirstVITE';
  const seoDescription = course?.shortDescription || 'Learn valuable skills with our comprehensive course.';
  const courseImage = course?.imageUrl || '/images/default-course-image.jpg';
  const canonicalUrl = course ? `https://firstvite.com/course/${course._id}` : 'https://firstvite.com/courses';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={course?.tags?.join(', ') || 'online course, e-learning, professional development'}
        canonical={canonicalUrl}
        og={{
          title: seoTitle,
          description: seoDescription,
          type: 'course',
          image: courseImage,
          url: canonicalUrl
        }}
      />
      {/* Course Header */}
      <div className="">
        <div className="container mx-auto px-4">
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

      {/* Course Detail */}
      <div className="container mx-auto px-4 py-6">
        <div className="">
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Course Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6 lg:w-2/3">
              {/* Course Meta */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {course.category?.name && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                    <FaTag className="mr-1.5 h-3 w-3" />
                    {course.category.name}
                  </span>
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
                {course.price && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                    {/* <FaDollarSign className="mr-1.5 h-3 w-3" /> */}
                    {formatPrice(course.price)}
                  </span>
                )}
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
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                  aria-label="Share course"
                  title="Share this course"
                >
                  <FaShare className="w-5 h-5" />
                </button>
                {course.brochureUrl && (
                  <button
                    onClick={downloadBrochure}
                    className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                    aria-label="Download brochure"
                    title="Download course brochure"
                  >
                    <FaFileAlt className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Course Title */}
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white leading-tight">
                  {course.title}
                </h1>

                {/* Course Rating */}
                <div className="flex items-center">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) =>
                      i < rating ? (
                        <FaStar key={i} className="text-yellow-500 w-5 h-5" />
                      ) : (
                        <FaRegStar
                          key={i}
                          className="text-yellow-500 w-5 h-5"
                        />
                      )
                    )}
                    <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
                      {course.rating?.toFixed(1) || "4"}
                      <span className="text-gray-500 font-normal">
                        ({course.reviews?.length || 18} Ratings)
                      </span>
                    </span>
                  </div>
                  {/* <span className="mx-3 text-gray-300 dark:text-gray-600">
                    •
                  </span> */}
                  {/* <span className="text-gray-600 dark:text-gray-400">
                    {course.enrolledStudents?.toLocaleString() || "500+"}{" "}
                    Students
                  </span> */}
                </div>

                {/* Course Description */}
                {/* <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {course.shortDescription ||
                    course.description
                      ?.replace(/<[^>]*>?/gm, "")
                      .substring(0, 200)}
                  <button className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                    Read more
                  </button>
                </p> */}
              </div>

              {/* Course Meta */}
              <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b border-gray-100 dark:border-gray-700 my-6">
                <div className="flex items-center text-sm">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <FaClock className="w-4 h-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-black dark:text-white">
                        Duration
                      </p>
                      <p className="font-medium text-xs text-black dark:text-white">
                        {course.duration || "Lifetime"} Weeks
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
                      <p className="text-xs text-black dark:text-white">
                        Lessons
                      </p>
                      <p className="font-medium text-xs text-black dark:text-white">
                        {course.curriculum?.length
                          ? course.curriculum.length * 2
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

                <div className="flex items-center text-sm group relative">
                  <div
                    className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded-lg transition-colors"
                    onClick={() => setShowCertificate(true)}
                  >
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      <FaCertificate className="w-4 h-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-black dark:text-white">
                        Certificate
                      </p>
                      <p className="font-medium text-xs text-black dark:text-white">
                        Included
                      </p>
                    </div>
                  </div>
                  {/* <div className="hidden group-hover:block absolute left-0 -top-40 w-64 bg-white dark:bg-slate-800 shadow-xl rounded-lg p-2 z-10 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sample Certificate
                    </p>
                    <img
                      src="http://firstvite.com/api/upload/file/img-1754374737042-580116956.jpg"
                      alt="Course Certificate Sample"
                      className="w-full h-auto rounded border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-certificate.jpg";
                      }}
                    />
                  </div> */}
                </div>

                {course.language && (
                  <>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <FaGlobe className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-black dark:text-white">
                          Language
                        </p>
                        <p className="font-medium text-xs text-black dark:text-white">
                          {course.language}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Course Description */}
              <div className="prose prose-gray max-w-none dark:prose-invert mb-6">
                <p className="text-black dark:text-white">
                  {course.shortDescription || "No description available."}
                </p>
              </div>

              {/* Course Includes */}
              {/* <div className="prose prose-gray max-w-none dark:prose-invert mb-6">
                <p className="text-black dark:text-white">
                  {course.includes || "No includes available."}
                </p>
              </div> */}

              {/* Course Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    // if (!isAuthenticated) {
                    //   // Redirect to login page with a return URL
                    //   navigate("/login", { state: { from: `/courses/${id}` } });
                    //   toast.info("Please log in to enroll in this course");
                    //   return;
                    // }
                    setShowCheckoutOptions(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
                >
                  Download Brochure <FaArrowRight className="ml-2" />
                </button>
                {course.previewVideo && (
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center">
                    <FaPlay className="mr-2" /> Preview this course
                  </button>
                )}
              </div>
            </div>

            {/* Course Sidebar On Right */}
            {/* Course Card */}
            <div className="lg:sticky lg:top-6 lg:w-1/3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-2xl">
                {/* Course Media */}
                <div className="relative group">
                  <div className="overflow-hidden rounded p-4 group">
                    <img
                      src={getImageUrl(course.thumbnail)}
                      alt={course.title}
                      className="w-full h-48 md:h-56 rounded object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/course-placeholder.jpg";
                      }}
                    />
                  </div>

                  <hr />

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

                {/* Course Price */}
                <div className="px-6 py-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {/* Course Price */}
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-black dark:text-white">
                          {course.price > 0
                            ? formatPrice(course.price)
                            : "Free"}
                        </span>
                        {course.originalPrice > course.price && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatPrice(course.originalPrice)}
                          </span>
                        )}
                        {discountPercentage > 0 && (
                          <span className="ml-2 text-sm text-red-500 dark:text-red-400">
                            {discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Course Includes */}
                    <div className="mt-2">
                      <p className="text-black dark:text-white">
                        This course includes:
                      </p>
                      <ul className="space-y-2">
                        {[
                          {
                            icon: (
                              <FaPlay className="text-blue-500 w-5 h-5 flex-shrink-0" />
                            ),
                            text: "On-demand video",
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
                            text: "Access on mobile and Tablet",
                          },
                          {
                            icon: (
                              <FaCalendar className="text-amber-500 w-5 h-5 flex-shrink-0" />
                            ),
                            text: "1 year full access",
                          },
                          {
                            icon: (
                              <FaCertificate className="text-red-500 w-5 h-5 flex-shrink-0" />
                            ),
                            text: "Certificate of completion",
                          },
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mt-0.5 text-sm">{item.icon}</span>
                            <span className="ml-3 text-sm text-black dark:text-white">
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8 sticky top-16 z-10 bg-white dark:bg-slate-900">
          <nav className="flex flex-wrap -mb-px whitespace-nowrap space-x-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-black dark:text-white hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("curriculum")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "curriculum"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-black dark:text-white hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "skills"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-black dark:text-white hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Skills
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "faq"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-black dark:text-white hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              FAQ
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {activeTab === "overview" && (
            <div className="text-black dark:text-white prose max-w-none dark:prose-invert">
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <div
                className="mb-6"
                dangerouslySetInnerHTML={{
                  __html: course.description || "No description available",
                }}
              />

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
                {course.prerequisites?.map((req, index) => (
                  <li key={index}>{req}</li>
                )) || <li>No specific requirements</li>}
              </ul>

              <h3 className="text-xl font-semibold mb-4">
                Who is this course for?
              </h3>
              {/* <ul className="list-disc pl-5 space-y-2">
                {course.whoIsThisFor?.map((item, index) => (
                  <li key={index}>{item}</li>
                )) || <li>Anyone interested in learning about this topic</li>}
              </ul> */}
              <li>Anyone interested in learning about this topic.</li>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div className="text-black dark:text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Full Curriculum</h2>
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
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                              <p className="text-black dark:text-white font-semibold text-sm sm:text-base">
                                {section.title}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {/* <span className="inline-flex items-center text-xs text-black dark:text-white bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                  Week {section.week}
                                </span> */}
                                <span className="inline-flex items-center text-xs text-black dark:text-white bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                  {section.topics?.length || 0} topics
                                </span>
                                {section.duration && (
                                  <span className="inline-flex items-center text-xs text-black dark:text-white bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                    {section.duration} hours
                                  </span>
                                )}
                              </div>
                            </div>
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
                                <div className="p-4">
                                  <p className="text-sm text-black dark:text-white mb-3">
                                    {section.description}
                                  </p>
                                  <h4 className="text-sm font-medium text-black dark:text-white mb-2">
                                    Topics Covered:
                                  </h4>
                                  <ul className="list-disc list-inside space-y-1">
                                    {section.topics?.map(
                                      (topic, topicIndex) => (
                                        <li
                                          key={topicIndex}
                                          className="text-sm text-black dark:text-white"
                                        >
                                          {topic}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
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
                    <h3 className="mt-2 text-lg font-medium text-black dark:text-white">
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

          {activeTab === "skills" && (
            <div className="flex flex-col gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-6 text-black dark:text-white">
                  Skills Student Will Learn
                </h3>
                {course.skills?.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.skills.map((skill, index) => (
                      <li key={index} className="flex items-start">
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
                        <span className="text-black dark:text-white">
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No skills available for this course.
                  </p>
                )}
              </div>

              {/* What Students Will Learn */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-6 text-black dark:text-white">
                  Topics Student Will Learn
                </h3>
                {course.whatYouWillLearn?.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.whatYouWillLearn.map((skill, index) => (
                      <li key={index} className="flex items-start">
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
                        <span className="text-black dark:text-white">
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No skills available for this course.
                  </p>
                )}
              </div>

              {/* prerequisites/ Requremnts */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-6 text-black dark:text-white">
                  Requremnts
                </h3>
                {course.prerequisites?.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start">
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
                        <span className="text-black dark:text-white">
                          {prerequisite}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No prerequisites available for this course.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
                Frequently Asked Questions
              </h3>

              {course.faqs?.length > 0 ? (
                <div className="space-y-4">
                  {course.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        className="w-full px-6 py-4 text-left bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
                        onClick={() => {
                          const newOpenIndex =
                            openFaqIndex === index ? null : index;
                          setOpenFaqIndex(newOpenIndex);
                        }}
                        aria-expanded={openFaqIndex === index}
                        aria-controls={`faq-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-black dark:text-white">
                            Q{index + 1}: {faq.question}
                          </h4>
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                              openFaqIndex === index
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
                      </button>
                      <div
                        id={`faq-${index}`}
                        className={`px-6 overflow-hidden transition-all duration-200 ${
                          openFaqIndex === index
                            ? "max-h-96 py-4"
                            : "max-h-0 py-0"
                        }`}
                      >
                        <p className="text-black dark:text-white">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No FAQs available for this course yet.
                  </p>
                </div>
              )}

              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Still have questions?
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Can't find the answer you're looking for? Our team is here to
                  help.
                </p>
                <button
                  onClick={() => {
                    setShowContactForm(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Contact Support
                </button>
              </div>
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
              <h3 className="text-xl font-bold mb-6 text-center text-black dark:text-white">
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
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed with Payment</span>
                </button>
              </div>

              <button
                onClick={() => setShowCheckoutOptions(false)}
                className="mt-6 w-full py-2 text-black dark:text-white hover:text-gray-800 dark:hover:text-black transition-colors"
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
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-bold text-black dark:text-white">
                  Process Your Enrollment by Fill the Form
                </p>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-black"
                  aria-label="Close"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-0 mb-2">
                <div className="relative flex-1">
                  <button
                    onClick={handleEnroll}
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center px-2 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                      isSubmitting
                        ? "opacity-80 cursor-not-allowed"
                        : "shadow-md hover:shadow-lg"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
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
                    <div className="absolute bottom-0 left-0 right-0 text-center">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium text-black bg-amber-500 rounded-full">
                        {Math.round(
                          (1 - course.price / course.originalPrice) * 100
                        )}
                        % OFF
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-black dark:text-white"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-black dark:text-white"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    disabled={!!currentUser}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-1 border ${
                      currentUser ? "cursor-not-allowed" : ""
                    } border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-black dark:text-white"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="+91 8080808080"
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
                    className="block text-sm font-medium text-black dark:text-white"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="1"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                {/* privacy polocy check box */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="privacy-policy"
                    name="privacy-policy"
                    value="privacy-policy"
                    onChange={handleInputChange}
                    required
                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:checked:bg-blue-600"
                  />
                  <label
                    htmlFor="privacy-policy"
                    className="ml-2 text-xs font-medium text-black dark:text-white"
                  >
                    I hereby agree with{" "}
                    <Link
                      to="/terms-of-service"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Privacy Policy
                    </Link>
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm text-white font-medium bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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

      {/* Payment Form Modal */}
      <AnimatePresence>
        {showPaymentForm && (
          <PaymentForm
            onClose={() => setShowPaymentForm(false)}
            courseId={id}
            courseName={course?.title}
            price={course?.price}
          />
        )}
      </AnimatePresence>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
      />
    </div>
  );
};

export default CourseDetail;
