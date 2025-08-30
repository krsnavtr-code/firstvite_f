import React, { useState, useEffect } from "react";
import { Card, Row, Col, Progress, Button, Empty, message, Spin } from "antd";
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  StarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLMS } from "../../contexts/LMSContext";
import { Link } from "react-router-dom";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

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
        // Load enrollments through LMS context
        await loadEnrollments();

        console.log("Enrollments:", enrollments);
        console.log(
          "Enrollment statuses:",
          enrollments.map((e) => ({
            id: e?._id,
            status: e?.status,
            course: e?.course?.title || e?.courseId,
          }))
        );

        // Debug: Log all enrollments with their status and progress
        console.log(
          "All enrollments with status and progress:",
          enrollments.map((e) => ({
            id: e?._id,
            title: e?.course?.title || "Unknown",
            status: e?.status,
            progress: e?.progress,
            completionStatus: e?.completionStatus,
          }))
        );

        // Calculate dashboard stats from enrollments
        const inProgressCount = enrollments.filter(
          (e) =>
            (e?.status === "active" ||
              e?.status === "enrolled" ||
              e?.status === "in_progress" ||
              e?.completionStatus === "in_progress") &&
            e?.progress > 0 &&
            e?.progress < 100
        ).length;

        const completedCount = enrollments.filter(
          (e) =>
            e?.progress === 100 ||
            e?.status === "completed" ||
            e?.completionStatus === "completed"
        ).length;

        // Calculate total hours (example: 1 hour per course)
        const totalHours = enrollments.length;

        setDashboardStats((prev) => ({
          ...prev,
          totalCourses: enrollments.length,
          inProgress: inProgressCount,
          completed: completedCount,
          totalHours,
          weeklyGoal: 10,
          currentWeekHours: Math.min(6, totalHours), // Example: 6 hours this week
        }));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        message.error("Failed to load dashboard data");
      }
    };

    fetchDashboardData();
  }, [enrollments.length]); // Only re-run when enrollments change

  const handleContinueLearning = (courseId) => {
    navigate(`/lms/courses/${courseId}`);
  };

  const renderEnrollmentCard = (enrollment) => {
    if (!enrollment || !enrollment.course) {
      return null; // Skip rendering if no course data
    }

    const course = enrollment.course;
    const progress = enrollment.progress || courseProgress?.[course._id] || 0;
    const lastAccessed = enrollment.lastAccessed
      ? new Date(enrollment.lastAccessed).toLocaleDateString()
      : "Never";
    const isEnrolled = ["enrolled", "in_progress", "completed"].includes(
      enrollment.status
    );
    const completedLessons = enrollment.completedLessons || 0;
    const totalLessons = course.lessons?.length || 0;

    return (
      <Card
        key={enrollment._id}
        hoverable
        style={{ width: "100%", marginBottom: 16 }}
        cover={
          <div
            style={{
              position: "relative",
              paddingTop: "56.25%",
              overflow: "hidden",
            }}
          >
            <img
              alt={course.title || "Course thumbnail"}
              src={
                course.thumbnail ||
                "https://via.placeholder.com/300x169?text=Course+Image"
              }
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {isEnrolled && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "rgba(0,0,0,0.7)",
                  color: "white",
                  padding: "8px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                }}
              >
                <span>
                  <ClockCircleOutlined /> {lastAccessed}
                </span>
                <span>
                  <CheckCircleOutlined /> {completedLessons}/{totalLessons}{" "}
                  Lessons
                </span>
              </div>
            )}
          </div>
        }
      >
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ marginBottom: 4 }}>
            {course.title || "Untitled Course"}
          </h3>
          {/* <p style={{ color: '#666', marginBottom: 8 }}>
          {course.instructor?.name || 'Instructor not specified'}
        </p> */}

          {true ? (
            <div>
              {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div> */}
              {/* <Progress percent={progress} showInfo={false} />
            <div style={{ margin: '8px 0', fontSize: 12, color: '#666' }}>
              <ClockCircleOutlined /> Last accessed: {lastAccessed}
            </div> */}
              <Button
                type="primary"
                block
                style={{ marginTop: 8 }}
                onClick={() => handleContinueLearning(course._id)}
                className="text-white bg-[#1677ff] hover:bg-[#1677ff]"
              >
                {progress === 0 ? "Start Learning" : "Continue Learning"}
              </Button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <StarOutlined style={{ color: "#ffc107", marginRight: 4 }} />
                <span style={{ marginRight: 16 }}>{course.rating}</span>
                <span>{course.students.toLocaleString()} students</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "1.2em", fontWeight: "bold" }}>
                  ${course.price}
                </span>
                <Button
                  type="primary"
                  onClick={() => navigate(`/lms/courses/${course.id}/enroll`)}
                >
                  Enroll Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (loading && enrollments.length === 0) {
    return (
      <div style={{ padding: "24px" }} className="text-black dark:text-black">
        <h1 style={{ marginBottom: 24 }}>Learning Progress</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <Spin indicator={antIcon} size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    const isUnauthorized = error?.response?.status === 401;

    return (
      <div
        style={{ padding: "24px", textAlign: "center" }}
        className="text-black dark:text-black"
      >
        <h1>Learning Progress</h1>
        <Empty
          description={
            isUnauthorized
              ? "Please log in to view your learning dashboard"
              : "Failed to load dashboard data"
          }
        >
          {isUnauthorized ? (
            <Button
              type="primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          ) : (
            <Button
              type="primary"
              style={{ marginTop: 16 }}
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: 24 }} className="text-black dark:text-black">
        Learning Progress
      </h1>

      {/* Learning Stats */}
      <Card
        style={{ marginBottom: 24 }}
        className="text-black dark:text-white bg-gray-200 dark:bg-[#001529]"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <BookOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                <h3>Total Courses</h3>
                <p style={{ fontSize: 24, fontWeight: "bold" }}>
                  {dashboardStats.totalCourses}
                </p>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <CheckCircleOutlined
                  style={{ fontSize: 24, color: "#722ed1" }}
                />
                <h3>Completed</h3>
                <p style={{ fontSize: 24, fontWeight: "bold" }}>
                  {dashboardStats.completed}
                </p>
              </div>
            </Card>
          </Col>
          {/* rEFREAL offer cAED */}
          <Col xs={24} sm={12} md={12}>
            <Card>
              <div className="text-center">
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  Referral & Earn Offer 🎉
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Invite friends & earn exciting rewards
                </p>
                <Link
                  to="/lms/refer-and-earn"
                  className="inline-block px-5 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-full shadow hover:bg-blue-700 transition"
                >
                  Click Here
                </Link>
              </div>
            </Card>
          </Col>
        </Row>

        {/* <div style={{ marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span>Learning Goal Progress</span>
            <span>
              {dashboardStats.currentWeekHours}h / {dashboardStats.weeklyGoal}h
            </span>
          </div>
          <Progress
            percent={Math.min(
              100,
              (dashboardStats.currentWeekHours / dashboardStats.weeklyGoal) *
                100
            )}
            showInfo={false}
            strokeColor={
              dashboardStats.currentWeekHours >= dashboardStats.weeklyGoal
                ? "#52c41a"
                : "#1890ff"
            }
          />
        </div> */}
      </Card>

      {/* Enrolled Courses */}
      <Card
        title={
          <span className="text-black dark:text-white">My Enrollments</span>
        }
        style={{ marginBottom: 24 }}
        className="text-black dark:text-white bg-gray-200 dark:bg-[#001529]"
      >
        <Row gutter={[16, 16]}>
          {enrollments.length > 0 ? (
            enrollments
              .filter((enrollment) => enrollment?.course)
              .map((enrollment) => (
                <Col key={enrollment._id} xs={24} sm={12} md={8} lg={6}>
                  {renderEnrollmentCard(enrollment)}
                </Col>
              ))
          ) : (
            <Col span={24}>
              <Empty
                description="You haven't enrolled in any courses yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate("/lms/courses")}>
                  Browse Courses
                </Button>
              </Empty>
            </Col>
          )}
        </Row>
      </Card>

      {/* Recommended Courses */}
      {recommendedCourses.length > 0 && (
        <Card
          title={
            <span className="text-black dark:text-white">
              Recommended For You
            </span>
          }
          style={{ marginBottom: 24 }}
          className="text-black dark:text-white bg-white dark:bg-[#001529]"
        >
          <Row gutter={[16, 16]}>
            {recommendedCourses.map((course, index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6}>
                {renderEnrollmentCard(course)}
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
