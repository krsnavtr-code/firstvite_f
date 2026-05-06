import React, { useEffect } from "react";
import { Card, Button, Empty, Skeleton, message } from "antd";
import {
  BookOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useLMS } from "../../contexts/LMSContext";
import { useNavigate } from "react-router-dom";

const { Meta } = Card;

const Dashboard = () => {
  const { enrollments, loading, loadEnrollments, error } = useLMS();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        await loadEnrollments();
      } catch (err) {
        console.error("Error loading enrollments:", err);
        message.error(error || "Failed to load your courses");
      }
    };
    fetchEnrollments();
  }, [loadEnrollments, error]);

  const handleCourseClick = (courseId) => {
    navigate(`/smart-board/courses/${courseId}`);
  };

  // --- Loading State ---
  if (loading && enrollments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">My Learning</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="h-80 shadow-sm dark:bg-slate-800 dark:border-slate-700"
            >
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --- Empty State ---
  if (enrollments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">My Learning</h1>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-slate-700">
          <Empty
            description={
              <div className="flex flex-col items-center">
                <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
                  You haven't enrolled in any courses yet
                </p>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Browse our course catalog to start your journey!
                </p>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/courses")}
                icon={<BookOutlined />}
                className="bg-blue-600 hover:bg-blue-700 border-none"
              >
                Browse All Courses
              </Button>
              <Button
                size="large"
                onClick={() => navigate("/courses?popular=true")}
                icon={<TrophyOutlined />}
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
              >
                Popular Courses
              </Button>
            </div>
          </Empty>
        </div>
      </div>
    );
  }

  // --- Main Dashboard ---
  return (
    <div className="p-6 max-w-7xl mx-auto transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Learning
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {enrollments.length}{" "}
            {enrollments.length === 1 ? "course" : "courses"} in progress
          </p>
        </div>
        <Button
          icon={<BookOutlined />}
          onClick={() => navigate("/courses")}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none h-10 px-6 rounded-lg"
        >
          Browse More Courses
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => {
          const course = enrollment.course;
          const isCompleted = enrollment.completionStatus === "completed";

          return (
            <div
              key={enrollment._id}
              onClick={() => handleCourseClick(course._id)}
              className="group cursor-pointer flex flex-col bg-white dark:bg-[#001525] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-800"
            >
              {/* Image Container */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                {course?.thumbnail ? (
                  <img
                    alt={course.title}
                    src={course.thumbnail}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <BookOutlined className="text-4xl mb-2" />
                    <span className="text-xs uppercase tracking-wider">
                      No Preview
                    </span>
                  </div>
                )}

                {/* Completed Badge */}
                {isCompleted && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center shadow-lg">
                    <CheckCircleOutlined className="mr-1" /> Completed
                  </div>
                )}
              </div>

              {/* Content Container */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-white line-clamp-2 mb-4 min-h-[3rem] group-hover:text-blue-600 transition-colors">
                  {course?.title || "Untitled Course"}
                </h3>

                <div className="mt-auto">
                  <Button
                    type={isCompleted ? "default" : "primary"}
                    block
                    className={`h-10 rounded-lg font-medium flex items-center justify-center gap-2 border-none transition-all
                      ${
                        isCompleted
                          ? "bg-slate-100 dark:bg-slate-800 dark:text-slate-300 text-slate-600 hover:bg-slate-200"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course._id);
                    }}
                  >
                    {isCompleted ? (
                      <>
                        View Course <CheckCircleOutlined />
                      </>
                    ) : (
                      <>
                        Continue{" "}
                        <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
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
