import React, { useEffect, useState } from "react";
import { Card, Progress, Button, Empty, message, Spin } from "antd";
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  StarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useLMS } from "../../contexts/LMSContext";

const antIcon = <LoadingOutlined className="text-2xl" spin />;

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    enrollments = [],
    loading,
    error,
    loadEnrollments,
    progress: courseProgress = {},
  } = useLMS();

  const [recommendedCourses] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    inProgress: 0,
    completed: 0,
    totalHours: 0,
    weeklyGoal: 10,
    currentWeekHours: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await loadEnrollments();

        const inProgressCount = enrollments.filter(
          (e) =>
            (e?.status === "active" ||
              e?.status === "enrolled" ||
              e?.status === "in_progress") &&
            e?.progress > 0 &&
            e?.progress < 100,
        ).length;

        const completedCount = enrollments.filter(
          (e) => e?.progress === 100 || e?.status === "completed",
        ).length;

        setDashboardStats((prev) => ({
          ...prev,
          totalCourses: enrollments.length,
          inProgress: inProgressCount,
          completed: completedCount,
          totalHours: enrollments.length,
          currentWeekHours: Math.min(6, enrollments.length),
        }));
      } catch (err) {
        message.error("Failed to load dashboard data");
      }
    };
    fetchDashboardData();
  }, [enrollments.length]);

  const handleContinueLearning = (courseId) => {
    navigate(`/smart-board/courses/${courseId}`);
  };

  const renderEnrollmentCard = (enrollment) => {
    if (!enrollment || !enrollment.course) return null;

    const course = enrollment.course;
    const progress = enrollment.progress || courseProgress?.[course._id] || 0;
    const lastAccessed = enrollment.lastAccessed
      ? new Date(enrollment.lastAccessed).toLocaleDateString()
      : "Never";
    const isEnrolled = ["enrolled", "in_progress", "completed"].includes(
      enrollment.status,
    );
    const completedLessons = enrollment.completedLessons || 0;
    const totalLessons = course.lessons?.length || 0;

    return (
      <Card
        key={enrollment._id}
        hoverable
        className="w-full mb-4 overflow-hidden border-none shadow-sm dark:bg-slate-800"
        cover={
          <div className="relative pt-[56.25%] overflow-hidden">
            <img
              alt={course.title}
              src={
                course.thumbnail ||
                "https://via.placeholder.com/300x169?text=Course+Image"
              }
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
            {isEnrolled && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 flex justify-between items-center text-[10px]">
                <span className="flex items-center gap-1">
                  <ClockCircleOutlined /> {lastAccessed}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircleOutlined /> {completedLessons}/{totalLessons}{" "}
                  Lessons
                </span>
              </div>
            )}
          </div>
        }
      >
        <div className="mb-3">
          <h3 className="text-sm font-bold truncate mb-2 dark:text-white">
            {course.title || "Untitled Course"}
          </h3>
          <Button
            type="primary"
            block
            onClick={() => handleContinueLearning(course._id)}
            className="mt-2 bg-blue-600 hover:bg-blue-700 border-none h-9 text-xs"
          >
            {progress === 0 ? "Start Learning" : "Continue Learning"}
          </Button>
        </div>
      </Card>
    );
  };

  if (loading && enrollments.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          Learning Progress
        </h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <Spin indicator={antIcon} size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
        Learning Progress
      </h1>

      {/* Learning Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center">
          <BookOutlined className="text-2xl text-blue-500 mb-2" />
          <h3 className="text-gray-500 dark:text-gray-400 text-xs">
            Total Courses
          </h3>
          <p className="text-2xl font-bold dark:text-white">
            {dashboardStats.totalCourses}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center">
          <CheckCircleOutlined className="text-2xl text-purple-500 mb-2" />
          <h3 className="text-gray-500 dark:text-gray-400 text-xs">
            Completed
          </h3>
          <p className="text-2xl font-bold dark:text-white">
            {dashboardStats.completed}
          </p>
        </div>

        {/* Referral Offer Card (Spans 2 columns on larger screens) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center flex flex-col justify-center items-center">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
            Referral & Earn Offer 🎉
          </h3>
          <p className="text-[11px] text-gray-500 mb-3">
            Invite friends & earn rewards
          </p>
          <Link
            to="/smart-board/refer-and-earn"
            className="px-6 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
          >
            Click Here
          </Link>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="p-4 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
          My Enrollments
        </h2>

        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {enrollments
              .filter((enrollment) => enrollment?.course)
              .map((enrollment) => (
                <div key={enrollment._id}>
                  {renderEnrollmentCard(enrollment)}
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-10 flex flex-col items-center">
            <Empty description="You haven't enrolled in any courses yet" />
            <Button
              type="primary"
              className="mt-4 bg-blue-600 border-none"
              onClick={() => navigate("/smart-board/courses")}
            >
              Browse Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
