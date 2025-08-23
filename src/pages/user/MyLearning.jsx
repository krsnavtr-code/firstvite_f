import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaBook,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { getUserEnrollments } from "../../api/enrollmentApi";

const MyLearning = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    inProgress: 0,
    completed: 0,
  });

  console.log("Auth context:", auth);
  console.log("Current user:", auth?.currentUser);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const userId = auth?.currentUser?._id;
        if (!userId) {
          console.error("User ID not found in auth context");
          setError("Please log in to view your enrolled courses");
          setLoading(false);
          return;
        }

        console.log("Fetching enrollments for user:", userId);
        // Get the token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        // Get enrollments with 'not_started' status to match the database record
        const response = await getUserEnrollments(userId, {
          token,
          status: "not_started", // Match the status in the database
        });

        console.log("API Response:", response);

        if (!response || !response.success) {
          const errorMessage =
            response?.message || "Failed to fetch enrollments";
          console.error("Error fetching enrollments:", errorMessage);
          setError(errorMessage);
          setLoading(false);
          return;
        }

        console.log("Raw enrollments data:", response.data);

        // The response now has a 'data' array containing the enrollments
        const enrollments = response.data || [];
        console.log("Fetched enrollments:", enrollments);

        if (enrollments.length === 0) {
          console.log("No active enrollments found");
          setEnrolledCourses([]);
          setStats({
            totalEnrolled: 0,
            inProgress: 0,
            completed: 0,
          });
          setLoading(false);
          return;
        }

        // Transform the data to match our component's expected format
        const courses = enrollments.map((enrollment) => {
          console.log("Processing enrollment:", enrollment);

          // Extract course data from the enrollment
          const course = enrollment.course || {};
          const instructor =
            typeof course.instructor === "object"
              ? course.instructor?.name || "Instructor"
              : "Instructor";

          return {
            id: enrollment._id,
            courseId: course._id || enrollment.courseId,
            title:
              course.title ||
              enrollment.courseTitle ||
              "Course Title Not Available",
            instructor: instructor,
            thumbnail:
              course.thumbnail ||
              "https://via.placeholder.com/300x150?text=Course+Image",
            progress: enrollment.progress || 0,
            lastAccessed: enrollment.lastAccessed
              ? new Date(enrollment.lastAccessed).toLocaleDateString()
              : "Never",
            status: enrollment.status || "active",
            totalLessons:
              course.modules?.reduce(
                (total, module) => total + (module.lessons?.length || 0),
                0
              ) || 0,
            completedLessons: Math.floor(
              ((enrollment.progress || 0) / 100) *
                (course.modules?.reduce(
                  (total, module) => total + (module.lessons?.length || 0),
                  0
                ) || 1)
            ),
            duration: course.duration || "N/A",
          };
        });

        console.log("Processed courses:", courses);
        setEnrolledCourses(courses);

        // Calculate stats
        const stats = {
          totalEnrolled: courses.length,
          inProgress: courses.filter((c) => c.progress > 0 && c.progress < 100)
            .length,
          completed: courses.filter((c) => c.progress === 100).length,
        };

        console.log("Calculated stats:", stats);
        setStats(stats);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        setError("Failed to load your courses. Please try again later.");
        toast.error("Failed to load your courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (auth?.currentUser) {
      console.log("User is authenticated, fetching courses...");
      fetchEnrolledCourses();
    } else {
      console.log("No authenticated user found, not fetching courses");
      setLoading(false);
    }
  }, [auth?.currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            My Learning
          </h1>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>

          {/* Courses Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full">
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
              Error Loading Courses
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is not authenticated
  console.log("Auth state:", {
    auth,
    hasUser: !!auth?.authUser,
    authUser: auth?.authUser,
    token: localStorage.getItem("token"),
    storedUser: localStorage.getItem("Users"),
  });

  if (!auth?.currentUser) {
    console.log("Auth context:", auth);
    console.log("Current user from context:", auth?.currentUser);
    console.log("Token in localStorage:", localStorage.getItem("token"));
    console.log("No user found, showing sign-in prompt");
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Access Your Learning
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sign in to view your enrolled courses and track your learning
              progress.
            </p>
            <div className="space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-pink-700 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Learning
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Continue learning from where you left off
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Enrolled Courses
            </h3>
            <p className="mt-2 text-3xl font-bold text-pink-600 dark:text-pink-400">
              {stats.totalEnrolled}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              In Progress
            </h3>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Completed
            </h3>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </p>
          </div>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <FaBook className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No courses enrolled yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Browse our courses and start learning today!
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col"
                >
                  <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-pink-600"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {course.instructor}
                    </p>

                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center">
                        <FaClock className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                        {course.duration}
                      </span>
                      <span className="flex items-center">
                        <FaCheckCircle className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                        {course.completedLessons} of {course.totalLessons}{" "}
                        lessons
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-medium text-pink-600 dark:text-pink-400">
                        {Math.round(course.progress)}% Complete
                      </span>
                      {/* <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          course.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {course.status === "pending"
                          ? "Pending Approval"
                          : "Active"}
                      </span> */}
                      {/* {course.payment && course.payment.status === "paid" ? (
                        <span className="text-xs font-medium text-pink-600 dark:text-pink-400">
                          Paid
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-pink-600 dark:text-pink-400">
                          Not Paid
                        </span>
                      )} */}
                    </div>

                    <button
                      onClick={() => {
                        if (course.status === "active") {
                          // Navigate to course content
                          navigate(`/courses/${course.courseId}`);
                        } else {
                          // Show message for pending courses
                          toast(
                            "Your enrollment is pending approval. We'll notify you once approved.",
                            {
                              icon: "⏳",
                              style: {
                                borderRadius: "10px",
                                background: "#363636",
                                color: "#fff",
                              },
                            }
                          );
                        }
                      }}
                      className={`mt-3 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        course.status === "active"
                          ? "bg-pink-600 hover:bg-pink-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                      disabled={course.status !== "active"}
                    >
                      {course.status === "active" ? (
                        <>
                          <FaPlay className="-ml-1 mr-2 h-4 w-4" />
                          {course.progress > 0
                            ? "Continue Learning"
                            : "Start Learning"}
                        </>
                      ) : (
                        "Enrollment Pending"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/courses"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-pink-700 bg-pink-100 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:bg-slate-700 dark:text-pink-300 dark:hover:bg-slate-600"
              >
                Browse More Courses
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;
