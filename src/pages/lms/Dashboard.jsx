import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLMS } from "../../contexts/LMSContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    enrollments = [],
    loading,
    loadEnrollments,
    progress: courseProgress = {},
  } = useLMS();

  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    completed: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await loadEnrollments();
        const completedCount = enrollments.filter(
          (e) => e?.progress === 100 || e?.status === "completed",
        ).length;

        setDashboardStats({
          totalCourses: enrollments.length,
          completed: completedCount,
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchDashboardData();
  }, [enrollments.length]);

  const handleContinueLearning = (courseId) => {
    navigate(`/smart-board/courses/${courseId}`);
  };

  // Custom Spinner Component
  if (loading && enrollments.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
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
        <p className="mt-4  font-medium">Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-300">
      <header className="mb-2">
        <h1 className="text-2xl font-bold">Learning Progress</h1>
        <p className="text-sm">
          Welcome back! Here is what's happening with your courses.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              ></path>
            </svg>
          </div>
          <div>
            <p className="text-sm ">Enrolled Course</p>
            <p className="text-2xl font-bold">{dashboardStats.totalCourses}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div>
            <p className="text-sm ">Completed</p>
            <p className="text-2xl font-bold">{dashboardStats.completed}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-3 py-2 rounded-2xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
          <Link to="/smart-board/refer-and-earn" className="relative z-10">
            <h3 className="font-bold text-lg">Refer & Earn 🎉</h3>
            <p className="text-blue-100 text-xs mb-1">
              Invite friends & earn rewards together.
            </p>
          </Link>
          <svg
            className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.586 18.586a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM16 10a1 1 0 11-2 0 1 1 0 012 0z"></path>
          </svg>
        </div>
      </div>

      {/* Welcome section */}
      <section className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Welcome back to your learning journey! 🚀
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
              You're making great progress! Keep up the momentum and continue
              building your skills. Every lesson brings you closer to your
              goals.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {dashboardStats.completed} courses completed
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {dashboardStats.totalCourses - dashboardStats.completed} in
                  progress
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {Math.round(
                    (dashboardStats.completed /
                      Math.max(dashboardStats.totalCourses, 1)) *
                      100,
                  )}
                  %
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Overall Progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="mt-8">
        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrollments
              .filter((e) => e?.course)
              .map((enrollment) => {
                const course = enrollment.course;
                const progress =
                  enrollment.progress || courseProgress?.[course._id] || 0;

                return (
                  <div
                    key={enrollment._id}
                    className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={
                          course.thumbnail ||
                          "https://via.placeholder.com/400x225"
                        }
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${progress === 100 ? "bg-green-500 text-white" : "bg-blue-600 text-white"}`}
                        >
                          {progress === 100 ? "Completed" : `${progress}% Done`}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-2 bg-slate-200 dark:bg-slate-700">
                      <h3 className="font-bold leading-snug mb-2 line-clamp-2 h-10">
                        {course.title}
                      </h3>

                      {/* Custom Progress Bar */}
                      <div className="w-full bg-white dark:bg-gray-200 h-1.5 rounded-full my-4">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <button
                        onClick={() => handleContinueLearning(course._id)}
                        className="w-full py-2.5 bg-white dark:bg-gray-200 hover:bg-blue-600 text-blue-600 font-bold text-xs rounded-xl transition-all duration-200 border border-transparent hover:border-blue-600"
                      >
                        {progress === 0
                          ? "Start Learning"
                          : "Continue Learning"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">No courses yet</h3>
            <p className=" text-sm mb-6 max-w-xs mx-auto">
              Explore our catalog and start your learning journey today.
            </p>
            <button
              onClick={() => navigate("/smart-board/courses")}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Browse Catalog
            </button>
          </div>
        )}
      </section>

      {/* Explore how eklabya can help you build a stellar profile! */}
      <section className="mt-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-800/50 dark:via-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Build Your Stellar Profile with Eklabya! 🌟
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
            Unlock your potential and showcase your skills to the world. Here's
            how Eklabya empowers your professional journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Verified Certificates
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Earn industry-recognized certificates that validate your skills
              and boost your resume credibility.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Skill Badges
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Collect digital badges for completed courses and showcase your
              expertise to potential employers.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Progress Tracking
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Monitor your learning journey with detailed analytics and share
              your achievements with your network.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Community Network
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Connect with peers, mentors, and industry experts to expand your
              professional network.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Portfolio Projects
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Build real-world projects that demonstrate your skills and create
              an impressive portfolio.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              Expert Instructors
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Learn from industry professionals and gain insights that go beyond
              traditional education.
            </p>
          </div>
        </div>
      </section>

      {/*  */}
    </div>
  );
};

export default Dashboard;
