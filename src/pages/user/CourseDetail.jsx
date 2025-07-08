import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../api/courseApi';
import { toast } from 'react-hot-toast';
import { 
  FaStar, FaUsers, FaClock, FaPlay, FaShare, FaBook, 
  FaCertificate, FaMoneyBillWave, FaGlobe, FaCheck, 
  FaFileAlt, FaUserTie, FaGraduationCap, FaTag, FaMobileAlt,
  FaListOl, FaQuestionCircle, FaPen, FaBookOpen, FaBriefcase,
  FaTwitter, FaLinkedin, FaGithub
} from 'react-icons/fa';
import { formatDuration, formatPrice } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUtils';
import AddToCartButton from '../../components/cart/AddToCartButton';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await getCourseById(id);
        if (response.success && response.data) {
          setCourse(response.data);
        } else {
          throw new Error(response.message || 'Failed to load course');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error(error.message || 'Failed to load course details');
        navigate('/courses');
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
          <p className="text-gray-600 dark:text-gray-300">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Course Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The course you're looking for doesn't exist or may have been removed.
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
  const discountPercentage = course.originalPrice > course.price 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Course Header */}
      <div className="bg-white dark:bg-slate-900 shadow mt-16">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <nav
            className="flex mb-4 overflow-x-auto mb-14"
            aria-label="Breadcrumb"
          >
            <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
              <li>
                <Link
                  to="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-500">/</span>
                  <Link
                    to="/courses"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                  >
                    Courses
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-500">/</span>
                  <Link
                    to={`/courses/category/${
                      course.category?.slug || course.category
                    }`}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                  >
                    {course.category?.name || "Category"}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-500">/</span>
                  <span className="text-gray-500 font-medium truncate max-w-xs md:max-w-md">
                    {course.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 mt-14">
            {/* Course Info */}
            <div className="lg:w-2/3">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {course.category?.name && (
                  <Link
                    to={`/courses/category/${
                      course.category.slug || course.category._id
                    }`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <FaTag className="mr-1.5 h-3 w-3" />
                    {course.category.name}
                  </Link>
                )}
                {course.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <FaStar className="mr-1.5 h-3 w-3" />
                    Featured
                  </span>
                )}
                {course.level && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {course.level}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                {course.title}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {course.shortDescription ||
                  course.description
                    ?.replace(/<[^>]*>?/gm, "")
                    .substring(0, 200)}
                ...
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center text-yellow-400">
                  <FaStar className="mr-1" />
                  <span className="text-gray-700 dark:text-gray-300 ml-1 font-medium">
                    {course.averageRating?.toFixed(1) || "New"}
                    <span className="text-gray-500 text-sm ml-1">
                      ({course.totalReviews || 0} reviews)
                    </span>
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <FaUsers className="mr-1.5" />
                  <span>
                    {course.totalStudents?.toLocaleString() || "0"} students
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <FaClock className="mr-1.5" />
                  <span>{formatDuration(course.duration) || "Self-paced"}</span>
                </div>
                {course.language && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaGlobe className="mr-1.5" />
                    <span>{course.language}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
                  onClick={() =>
                    window.scrollTo({
                      top:
                        document.getElementById("pricing-section").offsetTop -
                        100,
                      behavior: "smooth",
                    })
                  }
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
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                <div className="relative bg-gray-100 dark:bg-slate-700">
                  <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-auto object-cover dark:object-contain dark:bg-slate-700 dark:border-slate-700 dark:border rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/course-placeholder.jpg";
                    }}
                  />
                  {course.previewVideo && (
                    <button
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-4xl hover:bg-opacity-60 transition-all"
                      onClick={() => {
                        console.log("Open preview video");
                      }}
                    >
                      <div className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center">
                        <FaPlay className="ml-1" />
                      </div>
                    </button>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {course.price > 0 ? formatPrice(course.price) : "Free"}
                      </span>
                      {course.originalPrice > course.price && (
                        <div className="flex items-center">
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            {formatPrice(course.originalPrice)}
                          </span>
                          {discountPercentage > 0 && (
                            <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 rounded-full">
                              {discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {course.certificateIncluded && (
                      <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                        <FaCertificate className="mr-1.5" />
                        Certificate
                      </div>
                    )}
                  </div>

                  <AddToCartButton
                    product={{
                      id: course._id,
                      title: course.title,
                      price: course.price,
                      image: course.thumbnail,
                      description: course.shortDescription,
                    }}
                    className="w-full mb-4"
                  />

                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <FaBook className="text-gray-500 dark:text-gray-400 mr-3 w-4 h-4 flex-shrink-0" />
                      <span>
                        {course.curriculum?.reduce(
                          (total, section) =>
                            total + (section.lessons?.length || 0),
                          0
                        ) || 0}{" "}
                        Lessons
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-gray-500 dark:text-gray-400 mr-3 w-4 h-4 flex-shrink-0" />
                      <span>Lifetime access</span>
                    </div>
                    {course.language && (
                      <div className="flex items-center">
                        <FaGlobe className="text-gray-500 dark:text-gray-400 mr-3 w-4 h-4 flex-shrink-0" />
                        <span>Language: {course.language}</span>
                      </div>
                    )}
                    {course.certificateIncluded && (
                      <div className="flex items-center">
                        <FaCertificate className="text-gray-500 dark:text-gray-400 mr-3 w-4 h-4 flex-shrink-0" />
                        <span>Certificate of completion</span>
                      </div>
                    )}
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

      {/* Course Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex -mb-px">
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
              <p className="mb-6">{course.description}</p>

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
              <h2 className="text-2xl font-bold mb-6">Course Content</h2>
              {course.curriculum?.length > 0 ? (
                <div className="space-y-4">
                  {course.curriculum.map((section, sectionIndex) => (
                    <div
                      key={sectionIndex}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 font-medium flex justify-between items-center cursor-pointer">
                        <div className="flex items-center">
                          <span className="mr-2">{section.title}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {section.lessons?.length || 0} lessons •{" "}
                            {section.duration || "0 min"}
                          </span>
                        </div>
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                      <div className="bg-white dark:bg-slate-800">
                        {section.lessons?.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <FaPlay className="h-4 w-4 text-gray-400 mr-3" />
                              <span>{lesson.title}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {lesson.duration || "5:00"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No curriculum available for this course yet.</p>
              )}
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
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Student Feedback</h2>
                  <div className="flex items-center mt-2">
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
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      {course.rating?.toFixed(1) || "No"} rating •{" "}
                      {course.reviews?.length || 0} reviews
                    </span>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
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

      {/* Course Tabs */}
    </div>
  );
};

export default CourseDetail;
