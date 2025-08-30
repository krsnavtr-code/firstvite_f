import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Button,
  Progress,
  Tag,
  message,
  Skeleton,
  Empty,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { getSprintsByCourse } from "../../api/sprintApi";
import { getSessionsBySprint } from "../../api/sessionApi";
import { getTasksBySession } from "../../api/taskApi";
import { useLMS } from "../../contexts/LMSContext";
import { useAuth } from "../../contexts/AuthContext";

const { Meta } = Card;

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { enrollments } = useLMS();
  const { currentUser } = useAuth();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [sprintProgress, setSprintProgress] = useState({});

  // Check if task has been completed by user
  const isTaskCompleted = (task) => {
    if (!task?.submissions?.length) return false;
    const userId = currentUser?._id;
    if (!userId) return false;
    return task.submissions.some(
      (sub) => sub.user?._id === userId || sub.user === userId
    );
  };

  // Check if all tasks in a sprint are completed
  const areAllTasksCompleted = (tasks) => {
    if (!tasks || !tasks.length) return false;
    return tasks.every((task) => isTaskCompleted(task));
  };

  // Calculate completion percentage for a sprint
  const calculateSprintProgress = (sprint) => {
    if (!sprint.tasks || !sprint.tasks.length) return 0;

    const completedTasks = sprint.tasks.filter((task) => isTaskCompleted(task));
    return Math.round((completedTasks.length / sprint.tasks.length) * 100);
  };

  useEffect(() => {
    const fetchCourseAndSprints = async () => {
      try {
        setLoading(true);

        // Find the enrollment and course data
        const currentEnrollment = enrollments.find(
          (e) => e.course._id === courseId
        );
        if (!currentEnrollment) {
          message.error("Course not found in your enrollments");
          navigate("/lms/dashboard");
          return;
        }

        setEnrollment(currentEnrollment);
        setCourse(currentEnrollment.course);

        // Fetch sprints for this course with tasks
        const response = await getSprintsByCourse(courseId, {
          populate: "tasks",
        });
        console.log("Sprints API Response:", response);

        let sprintsData = [];
        if (response && response.data && Array.isArray(response.data.sprints)) {
          sprintsData = response.data.sprints;
        } else if (Array.isArray(response)) {
          sprintsData = response;
        } else {
          console.warn("Unexpected sprints data format:", response);
        }

        // Calculate progress for each sprint and ensure tasks are properly loaded
        const progressData = {};
        const updatedSprints = [];

        for (const sprint of sprintsData) {
          // Make sure we have tasks for this sprint
          let sprintWithTasks = sprint;
          if (!sprint.tasks || !sprint.tasks.length) {
            try {
              // Get all sessions for this sprint first
              const sessionsResponse = await getSessionsBySprint(sprint._id);
              const sessions = sessionsResponse?.data?.sessions || [];

              // Get all tasks from all sessions
              const allTasks = [];
              for (const session of sessions) {
                const tasksResponse = await getTasksBySession(session._id);
                if (tasksResponse?.data?.tasks) {
                  allTasks.push(...tasksResponse.data.tasks);
                }
              }
              sprintWithTasks = {
                ...sprint,
                tasks: allTasks,
              };
            } catch (error) {
              console.error(
                `Error loading tasks for sprint ${sprint._id}:`,
                error
              );
            }
          }

          progressData[sprint._id] = calculateSprintProgress(sprintWithTasks);
          updatedSprints.push(sprintWithTasks);
        }

        setSprintProgress(progressData);
        setSprints(updatedSprints);
      } catch (error) {
        console.error("Error loading course details:", error);
        message.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    if (enrollments.length > 0 && currentUser) {
      fetchCourseAndSprints();
    }
  }, [courseId, enrollments, navigate, currentUser]);

  const handleSprintClick = (sprint, e) => {
    // Prevent the card click from interfering with button click
    if (e && e.stopPropagation) e.stopPropagation();
    navigate(`/lms/courses/${courseId}/sprints/${sprint._id}`);
  };

  const getSprintStatus = (sprint) => {
    if (!sprint.tasks || !sprint.tasks.length) return "Not Started";

    const hasCompletedTasks = sprint.tasks.some((task) =>
      isTaskCompleted(task)
    );
    const allTasksCompleted = areAllTasksCompleted(sprint.tasks);

    if (allTasksCompleted) return "Completed";
    if (hasCompletedTasks) return "In Progress";
    return "Not Started";
  };

  const getStatusColor = (sprint) => {
    if (!sprint.tasks || !sprint.tasks.length) return "default";

    const hasCompletedTasks = sprint.tasks.some((task) =>
      isTaskCompleted(task)
    );
    const allTasksCompleted = areAllTasksCompleted(sprint.tasks);

    if (allTasksCompleted) return "success";
    if (hasCompletedTasks) return "processing";
    return "default";
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Empty description="Course not found" />
      </div>
    );
  }

  // Calculate overall course progress based on sprint progress
  const calculateCourseProgress = () => {
    if (sprints.length === 0) return 0;

    const totalProgress = Object.values(sprintProgress).reduce(
      (sum, progress) => sum + progress,
      0
    );

    return Math.round(totalProgress / sprints.length);
  };

  const progress = calculateCourseProgress();
  const isCompleted = progress === 100;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/lms/dashboard")}
        className="mb-4 text-black dark:text-black"
      >
        Back to Dashboard
      </Button>

      {/* Course Card */}
      <div className="bg-gray-200 dark:bg-[#001529] rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <img
              src={
                course.thumbnail ||
                "https://via.placeholder.com/300x200?text=Course"
              }
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/300x200?text=Course";
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {course.description || "No description available"}
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <Tag
                    color={
                      progress === 100
                        ? "success"
                        : progress > 0
                        ? "processing"
                        : "default"
                    }
                    className="text-sm"
                  >
                    {progress === 100
                      ? "Completed"
                      : progress > 0
                      ? `In Progress (${progress}%)`
                      : "Not Started"}
                  </Tag>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {sprints.length}{" "}
                    {sprints.length === 1 ? "Sprint" : "Sprints"}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Your Progress</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {progress}% •{" "}
                  {sprints.filter((s) => sprintProgress[s._id] === 100).length}/
                  {sprints.length} Sprints
                </span>
              </div>
              <div className="relative">
                <div className="flex items-center mb-1">
                  <Progress
                    percent={progress}
                    status={isCompleted ? "success" : "active"}
                    showInfo={false}
                    strokeWidth={8}
                    className="flex-1"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {sprints.filter((s) => sprintProgress[s._id] === 100).length}{" "}
                  of {sprints.length} sprints completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sprints Section */}
      <div className="mb-10">
        {/* Heading */}
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-black">
          <BookOutlined className="mr-3 text-blue-600" /> Course Sprints
        </h2>

        {/* Empty State */}
        {sprints.length === 0 ? (
          <Empty
            description={
              <span className="text-gray-600 dark:text-gray-400">
                No sprints available for this course
              </span>
            }
            className="py-12"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {sprints.map((sprint) => (
              <Card
                key={sprint._id}
                className="hover:shadow-xl transition-all bg-white dark:bg-[#0d1b2a] text-black dark:text-white rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                onClick={(e) => handleSprintClick(sprint, e)}
              >
                <div className="flex flex-col h-full">
                  {/* Title + Status */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      {sprint.name}
                      <Tag
                        color={getStatusColor(sprint)}
                        className="text-xs px-2 py-0.5 rounded"
                      >
                        {getSprintStatus(sprint)}
                      </Tag>
                    </h3>
                    <Button
                      type="text"
                      size="small"
                      icon={
                        sprintProgress[sprint._id] === 100 ? (
                          <CheckCircleOutlined className="text-green-500" />
                        ) : (
                          <PlayCircleOutlined className="text-blue-500" />
                        )
                      }
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={(e) => handleSprintClick(sprint, e)}
                    >
                      {sprintProgress[sprint._id] === 100
                        ? "Review"
                        : "Continue"}
                    </Button>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                    {sprint.description || "No description available"}
                  </p>

                  {/* WhatsApp Group Button */}
                  {sprint.whatsappGroupLink && (
                    <div className="mt-3 overflow-hidden w-fit">
                      <Button
                        type="primary"
                        icon={<WhatsAppOutlined />}
                        size="small"
                        className="bg-green-600 hover:bg-green-700 border-none rounded px-4 transition-transform duration-300 hover:translate-x-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            sprint.whatsappGroupLink,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                      >
                        Join WhatsApp Group
                      </Button>
                    </div>
                  )}

                  {/* Duration + Tasks */}
                  {sprint.duration && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-3">
                      <span>⏳ {sprint.duration} days</span>
                      <span>📝 {sprint.tasks?.length || 0} tasks</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {sprintProgress[sprint._id] > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {sprintProgress[sprint._id] || 0}%
                        </span>
                      </div>
                      <Progress
                        percent={sprintProgress[sprint._id] || 0}
                        status={
                          sprintProgress[sprint._id] === 100
                            ? "success"
                            : "active"
                        }
                        showInfo={false}
                        strokeWidth={6}
                        className="mb-0"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
