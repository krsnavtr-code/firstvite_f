import React, { useEffect } from "react";
import { useLMS } from "../../contexts/LMSContext";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const { enrollments, loading, loadEnrollments } = useLMS();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        await loadEnrollments();
      } catch (err) {
        console.error("Error loading enrollments:", err);
      }
    };
    fetchEnrollments();
  }, [loadEnrollments]);

  const handleCourseClick = (courseId) => {
    navigate(`/smart-board/courses/${courseId}`);
  };

  // --- Loading State (Tailwind Skeletons) ---
  if (loading && enrollments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4"
            >
              <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Empty State (Custom Tailwind Design) ---
  if (enrollments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
          My Learning
        </h1>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-full">
              <svg
                className="w-16 h-16 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            No active courses
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Start your journey by
            exploring our popular classes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              Browse Catalog
            </button>
            <button
              onClick={() => navigate("/courses?popular=true")}
              className="px-8 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl transition-all"
            >
              Popular Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Dashboard ---
  return (
    <div className="max-w-7xl mx-auto transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Learning
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {enrollments.length}{" "}
            {enrollments.length === 1 ? "course" : "courses"} in progress
          </p>
        </div>
        <button
          onClick={() => navigate("/courses")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          More Courses
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {enrollments
          .filter(
            (enrollment, index, arr) =>
              arr.findIndex((e) => e._id === enrollment._id) === index,
          )
          .map((enrollment) => {
            const course = enrollment.course;
            const isCompleted = enrollment.completionStatus === "completed";

            return (
              <div
                key={enrollment._id}
                className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {course?.thumbnail ? (
                    <img
                      alt={course.title}
                      src={course.thumbnail}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
                      <svg
                        className="w-12 h-12 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Status Badge */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center shadow-lg">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Completed
                    </div>
                  )}
                </div>

                {/* Content Container */}
                <div className="px-3 py-2 flex flex-col flex-1 bg-gray-200 dark:bg-gray-800">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-2 mb-6 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">
                    {course?.title || "Untitled Course"}
                  </h3>

                  <div className="mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course._id);
                      }}
                      className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2
                      ${
                        isCompleted
                          ? "bg-transparent border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
                      }`}
                    >
                      {isCompleted ? "Review Materials" : "Continue Lesson"}
                      {!isCompleted && (
                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Dashboard;
