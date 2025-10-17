import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaRegStar, FaRegClock, FaUserGraduate } from "react-icons/fa";
import axios from "../../api/axios";
import { getCardBgColor } from "../../utils/gradients";

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// CourseCard component for displaying individual course
const CourseCard = ({ course }) => {
  const [imageState, setImageState] = useState({
    url: "",
    error: false,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!course?.thumbnail) {
        if (isMounted) {
          setImageState({
            url: "/images/course-placeholder.jpg",
            error: false,
            loading: false,
          });
        }
        return;
      }

      let url = course.thumbnail;

      // If it's not already a full URL, construct it
      if (
        !url.startsWith("http") &&
        !url.startsWith("https") &&
        !url.startsWith("//")
      ) {
        const cleanPath = url.replace(/^\/+/, "");
        const baseUrl = API_BASE_URL || "";
        url = `${baseUrl}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1"); // Remove duplicate slashes
      }

      // Set loading state
      if (isMounted) {
        setImageState({
          url: url,
          error: false,
          loading: true,
        });
      }

      // Create a new image to test loading
      const img = new Image();

      const handleLoad = () => {
        if (isMounted) {
          setImageState({
            url: url,
            error: false,
            loading: false,
          });
        }
      };

      const handleError = () => {
        if (isMounted) {
          setImageState({
            url: "/images/course-placeholder.jpg",
            error: true,
            loading: false,
          });
        }
      };

      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = url;

      // Set a longer timeout for slow connections
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          // Only show error if the image hasn't loaded yet
          const imgElement = new Image();
          imgElement.onload = () => {};
          imgElement.onerror = () => {
            if (isMounted) {
              setImageState({
                url: "/images/course-placeholder.jpg",
                error: true,
                loading: false,
              });
            }
          };
          imgElement.src = url;
        }
      }, 5000); // Increased to 5 seconds

      return () => {
        isMounted = false;
        img.onload = null;
        img.onerror = null;
        clearTimeout(timeoutId);
      };
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [course?._id, course?.thumbnail]); // Only re-run if course ID or thumbnail changes

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  // Get background color class
  const bgColor = getCardBgColor(course);

  return (
    <div
      className={`${bgColor} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
    >
      <Link to={`/course/${course.slug || course._id}`}>
        <div className="relative pb-9/16">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {imageState.loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="animate-pulse rounded-full h-12 w-12 border-4 border-t-blue-500 border-gray-300 dark:border-gray-600"></div>
              </div>
            ) : imageState.error || !course.thumbnail ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center p-4">
                  <div className="text-gray-500 dark:text-gray-400">
                    No image available
                  </div>
                  {process.env.NODE_ENV === "development" &&
                    course.thumbnail && (
                      <div className="text-xs mt-2 text-gray-400 break-all max-w-xs">
                        {course.thumbnail}
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="w-full h-[200px] bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                <img
                  src={imageState.url}
                  alt={course.title || "Course image"}
                  className="max-w-full max-h-full object-contain transition-opacity duration-300"
                  style={{ opacity: imageState.loading ? 0 : 1 }}
                  loading="lazy"
                  onError={() => {
                    setImageState({
                      url: "/images/course-placeholder.jpg",
                      error: true,
                      loading: false,
                    });
                  }}
                />
              </div>
            )}
            {/* Hidden debug info - only shown in development */}
            {process.env.NODE_ENV === "development" && (
              <div className="hidden">
                <div>Image URL: {course.thumbnail}</div>
                <div>Processed URL: {imageState.url}</div>
                <div>Course ID: {course._id}</div>
                <div>Loading: {imageState.loading ? "true" : "false"}</div>
                <div>Error: {imageState.error ? "true" : "false"}</div>
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
          <h3 className="font-bold text-black dark:text-white text-lg mb-2 line-clamp-2 mb-0 h-14">
            {course.title}
          </h3>
          <p className="text-black dark:text-white mt-0 text-sm mb-3 line-clamp-2 h-10">
            {course.shortDescription
              ?.replace(/^<p>/i, "")
              .replace(/<\/p>$/i, "")}
          </p>
          <div className="flex items-center mb-2">
            <div className="flex" style={{ color: "#F47C26" }}>
              {renderStars(course.rating || 4)}
            </div>
            {/* <span className="ml-2 text-sm text-black dark:text-gray-400">
              ({course.enrollmentCount || course.enrolledStudents || 0}{" "}
              students)
            </span> */}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-black dark:text-gray-400">
              <FaRegClock className="mr-1" />
              {course.duration || "Self-paced"} Weeks
            </div>
            <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
              {course.level || "All Levels"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set a timeout for the request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        // console.log("Fetching featured courses with showOnHome=true");
        const response = await axios.get("/courses", {
          params: {
            showOnHome: "true",
            limit: 8, // Limit to 6 featured courses
            sort: "-createdAt", // Show most recently added first
            isPublished: "true", // Only get published courses
          },
          signal: controller.signal,
        });

        // Clear the timeout if the request completes
        clearTimeout(timeoutId);

        console.log("Featured courses response:", response);

        // Handle different response formats
        let courses = [];
        if (Array.isArray(response.data)) {
          courses = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          courses = response.data.data;
        } else if (response.data && response.data.courses) {
          courses = response.data.courses;
        } else {
          throw new Error("Invalid response format from server");
        }

        console.log("Parsed featured courses:", courses);

        // Filter courses that are marked to show on home page
        // If no courses are marked, show the most recent published courses
        const featuredCourses = courses.filter(
          (course) => course.showOnHome !== false // Include if true or undefined
        );

        console.log("Filtered featured courses:", featuredCourses);

        // Set the courses, or an empty array if none found
        setCourses(featuredCourses);
      } catch (err) {
        console.error("Error fetching featured courses:", err);
        setError("Failed to load featured courses");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white text-center">
            Best E-Learning Courses
          </h1>
          <p className="mt-4 text-xl text-center text-black dark:text-white">
            Practical, skill-based online courses in areas like IT, business,
            design, and marketing. Learn at your own pace with real-world
            projects and expert-led content
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses
              .map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link
            to="/courses"
            className="inline-flex text-white items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PopularCourses;
