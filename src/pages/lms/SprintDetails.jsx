import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  List,
  Typography,
  Skeleton,
  Empty,
  message,
  Tag,
  Collapse,
  Modal,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  DownOutlined,
  RightOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
  LockOutlined,
  CheckOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { getSessionsBySprint } from "../../api/sessionApi";
import { getTasksBySession } from "../../api/taskApi";
import { getTask } from "../../api/taskApi";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const SprintDetails = () => {
  const { courseId, sprintId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [sessionTasks, setSessionTasks] = useState({});
  const [loadingTasks, setLoadingTasks] = useState({});
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [currentResults, setCurrentResults] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [questionsModalVisible, setQuestionsModalVisible] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const { currentUser, isAuthenticated } = useAuth();

  // Debug: Log auth state
  useEffect(() => {
    console.log("Auth State - isAuthenticated:", isAuthenticated);
    console.log("Auth State - Current User:", currentUser);
  }, [isAuthenticated, currentUser]);

  // Get user ID safely
  const getUserId = () => {
    const userId = currentUser?._id || localStorage.getItem("userId");
    return userId;
  };

  // Check if task has been attempted by user (locked if any submission exists)
  const isTaskCompleted = (task) => {
    if (!task?.submissions?.length) return false;
    const userId = getUserId();
    return task.submissions.some(
      (sub) => sub.user?._id === userId || sub.user === userId
    );
  };

  // Check if all tasks in a session are completed
  const areAllTasksCompleted = (tasks) => {
    if (!tasks || !tasks.length) return false;
    return tasks.every((task) => isTaskCompleted(task));
  };

  // Calculate overall sprint completion status
  const getSprintStatus = () => {
    let totalTasks = 0;
    let completedTasks = 0;

    // Count all tasks and completed tasks across all sessions
    Object.values(sessionTasks).forEach((tasks) => {
      if (!tasks || !Array.isArray(tasks)) return;

      tasks.forEach((task) => {
        totalTasks++;
        if (isTaskCompleted(task)) {
          completedTasks++;
        }
      });
    });

    if (totalTasks === 0) return { status: "not_started", progress: 0 };

    const progress = Math.round((completedTasks / totalTasks) * 100);

    if (completedTasks === 0) return { status: "not_started", progress };
    if (completedTasks === totalTasks) return { status: "completed", progress };
    return { status: "in_progress", progress };
  };

  // Check if a task should be unlocked
  const isTaskUnlocked = (taskIndex, tasks, sessionIndex, allSessions) => {
    // First task of the first session is always unlocked
    if (sessionIndex === 0 && taskIndex === 0) return true;

    // If no previous task in the same session, check previous session
    if (taskIndex === 0) {
      const prevSession = allSessions[sessionIndex - 1];
      const prevSessionTasks = sessionTasks[prevSession?._id] || [];
      return areAllTasksCompleted(prevSessionTasks);
    }

    // Check if previous task in the same session is completed
    return isTaskCompleted(tasks[taskIndex - 1]);
  };

  // Check if a session is unlocked
  const isSessionUnlocked = (sessionIndex, allSessions) => {
    // First session is always unlocked
    if (sessionIndex === 0) return true;

    // Check if all tasks in previous session are completed
    const prevSession = allSessions[sessionIndex - 1];
    const prevSessionTasks = sessionTasks[prevSession?._id] || [];
    return areAllTasksCompleted(prevSessionTasks);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch all sessions first
        const sessionsResponse = await getSessionsBySprint(sprintId);
        if (!sessionsResponse?.data?.sessions) {
          setLoading(false);
          return;
        }

        const sessionsData = sessionsResponse.data.sessions;
        setSessions(sessionsData);

        // Then fetch all tasks for all sessions in parallel
        const tasksPromises = sessionsData.map((session) =>
          getTasksBySession(session._id)
            .then((response) => ({
              sessionId: session._id,
              tasks: response?.data?.tasks || [],
            }))
            .catch((error) => {
              console.error(
                `Error fetching tasks for session ${session._id}:`,
                error
              );
              return { sessionId: session._id, tasks: [] };
            })
        );

        const tasksResults = await Promise.all(tasksPromises);

        // Update session tasks state
        const newSessionTasks = {};
        tasksResults.forEach(({ sessionId, tasks }) => {
          if (tasks && tasks.length > 0) {
            newSessionTasks[sessionId] = tasks;
          }
        });

        setSessionTasks((prev) => ({
          ...prev,
          ...newSessionTasks,
        }));
      } catch (error) {
        console.error("Error loading data:", error);
        message.error("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [sprintId]);

  const toggleSession = async (sessionId) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));

    // Only fetch tasks if we haven't already
    if (!sessionTasks[sessionId] && !loadingTasks[sessionId]) {
      try {
        setLoadingTasks((prev) => ({ ...prev, [sessionId]: true }));
        const response = await getTasksBySession(sessionId);
        if (response?.data?.tasks) {
          setSessionTasks((prev) => ({
            ...prev,
            [sessionId]: response.data.tasks,
          }));
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        message.error("Failed to load tasks");
      } finally {
        setLoadingTasks((prev) => ({ ...prev, [sessionId]: false }));
      }
    }
  };

  if (loading) return <Skeleton active />;

  return (
    <div className="max-w-5xl mx-auto">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/lms/courses/${courseId}`)}
        className="mb-4 text-black dark:text-black"
      >
        Back to Course
      </Button>

      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-0 text-black dark:text-black">
          Sprint Sessions
        </Title>
        {sessions.length > 0 && (
          <div className="flex items-center">
            <span className="mr-2 text-sm text-black">
              {getSprintStatus().status === "completed"
                ? "Completed"
                : "In Progress"}
            </span>
            <Progress
              type="circle"
              percent={getSprintStatus().progress}
              width={36}
              strokeWidth={12}
              format={(percent) => `${percent}%`}
              status={
                getSprintStatus().status === "completed" ? "success" : "active"
              }
              className="ml-2"
            />
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <Empty description="No sessions available" />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="border border-[#001529] dark:border-gray-600 bg-[#001529] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className={`p-4 flex justify-between items-center transition-colors ${
                  isSessionUnlocked(
                    sessions.findIndex((s) => s._id === session._id),
                    sessions
                  )
                    ? "bg-gray-200 dark:bg-[#001529] text-black dark:text-white hover:bg-blue-50 dark:hover:bg-[#001550] cursor-pointer border-l-4 border-blue-500"
                    : "bg-gray-200 dark:bg-[#001529] text-black dark:text-white cursor-not-allowed border-l-4 border-gray-300"
                }`}
                onClick={() => {
                  if (
                    isSessionUnlocked(
                      sessions.findIndex((s) => s._id === session._id),
                      sessions
                    )
                  ) {
                    toggleSession(session._id);
                  }
                }}
              >
                <div className="flex items-center">
                  {(() => {
                    const sessionTasksList = sessionTasks[session._id] || [];
                    const completedTasks = sessionTasksList.filter((task) =>
                      isTaskCompleted(task)
                    );
                    const completionPercentage =
                      sessionTasksList.length > 0
                        ? Math.round(
                            (completedTasks.length / sessionTasksList.length) *
                              100
                          )
                        : 0;
                    const isCompleted = areAllTasksCompleted(sessionTasksList);
                    const inProgress =
                      completedTasks.length > 0 && !isCompleted;

                    // Determine icon to show
                    let icon = (
                      <PlayCircleOutlined className="text-blue-500 text-xl mr-3" />
                    );

                    if (isCompleted) {
                      icon = (
                        <CheckCircleOutlined className="text-green-500 text-xl mr-3" />
                      );
                    } else if (inProgress) {
                      icon = (
                        <div className="relative mr-3">
                          <PlayCircleOutlined className="text-blue-500 text-xl" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">
                              {completionPercentage}%
                            </span>
                          </div>
                        </div>
                      );
                    } else if (
                      !isSessionUnlocked(
                        sessions.findIndex((s) => s._id === session._id),
                        sessions
                      )
                    ) {
                      icon = (
                        <LockOutlined className="text-gray-400 text-xl mr-3" />
                      );
                    }

                    return (
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-start gap-3 flex-1">
                          {icon}
                          <div className="flex-1">
                            <div className="font-medium flex items-center">
                              {session.name}
                              {sessionTasksList.length > 0 && (
                                <Tag
                                  color={
                                    isCompleted
                                      ? "success"
                                      : inProgress
                                      ? "processing"
                                      : "default"
                                  }
                                  className="ml-2 text-xs"
                                >
                                  {isCompleted
                                    ? "Completed"
                                    : inProgress
                                    ? "In Progress"
                                    : "Not Started"}
                                </Tag>
                              )}
                            </div>
                            <div className="text-black dark:text-white text-sm">
                              {session.description || "No description"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {session.zoomMeetingLink && (
                            <a
                              href={session.zoomMeetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-xl shadow hover:bg-blue-700 transition whitespace-nowrap"
                            >
                              <VideoCameraOutlined />
                              Join Meeting
                            </a>
                          )}

                          {session.videoUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentVideoUrl(session.videoUrl);
                                setVideoModalVisible(true);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl shadow hover:bg-blue-100 transition whitespace-nowrap"
                            >
                              <PlayCircleOutlined />
                              Watch
                            </button>
                          )}

                          {/* Video Modal */}
                          <Modal
                            title="Video Player"
                            open={videoModalVisible}
                            onCancel={() => setVideoModalVisible(false)}
                            footer={null}
                            width={800}
                            destroyOnClose
                          >
                            <div className="w-full aspect-video">
                              <iframe
                                src={currentVideoUrl.replace(
                                  "/view?usp=sharing",
                                  "/preview"
                                )}
                                width="100%"
                                height="100%"
                                allow="autoplay"
                                frameBorder="0"
                                allowFullScreen
                              />
                            </div>
                          </Modal>

                          {/* Questions Modal */}
                          <Modal
                            title="Questions & Answers"
                            open={questionsModalVisible}
                            onCancel={() => setQuestionsModalVisible(false)}
                            footer={null}
                            width={700}
                          >
                            <div className="space-y-4">
                              {currentQuestions.map((question, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                  <div className="font-medium mb-2">
                                    {index + 1}. {question.question}
                                  </div>
                                  <div className="space-y-2">
                                    {question.options?.map((option, optIndex) => {
                                      // Handle both string and object options
                                      const optionText = typeof option === 'object' ? option.text : option;
                                      const isCorrect = typeof option === 'object' 
                                        ? option.isCorrect 
                                        : question.correctAnswer === optIndex;
                                      
                                      return (
                                        <div 
                                          key={optIndex}
                                          className={`p-2 rounded ${
                                            isCorrect
                                              ? 'bg-green-50 text-green-700 border border-green-200' 
                                              : 'bg-gray-50'
                                          }`}
                                        >
                                          {String.fromCharCode(65 + optIndex)}. {optionText}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {question.explanation && (
                                    <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded text-sm">
                                      <strong>Explanation:</strong> {question.explanation}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </Modal>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center">
                  {session.completed && (
                    <CheckCircleOutlined className="text-green-500 mr-3" />
                  )}
                  {expandedSessions[session._id] ? (
                    <DownOutlined className="text-black dark:text-white" />
                  ) : (
                    <RightOutlined className="text-black dark:text-white" />
                  )}
                </div>
              </div>

              {expandedSessions[session._id] && (
                <div
                  className={
                    !isSessionUnlocked(
                      sessions.findIndex((s) => s._id === session._id),
                      sessions
                    )
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                >
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-black">
                        <FileTextOutlined className="mr-2" />
                        Tasks
                      </h4>
                      <Button
                        type="link"
                        size="small"
                        className="text-blue font-bold"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const userId = getUserId();
                            if (!userId) {
                              console.error(
                                "User not authenticated. Auth state:",
                                {
                                  isAuthenticated,
                                  hasUser: !!currentUser,
                                  userId: currentUser?._id,
                                  localStorageUser:
                                    localStorage.getItem("user"),
                                }
                              );
                              message.error(
                                "Please log in to view test results."
                              );
                              return;
                            }

                            console.log("Fetching results for user:", userId);
                            const tasks = sessionTasks[session._id] || [];
                            console.log("Tasks in session:", tasks.length);

                            const results = [];

                            // Get submissions for each task
                            for (const task of tasks) {
                              try {
                                console.log("Fetching task:", task._id);
                                const response = await getTask(task._id);
                                console.log("Task API response:", response);

                                // Handle different response structures
                                const taskData =
                                  response?.data?.task || response?.task;
                                console.log("Task data:", taskData);

                                const submissions = taskData?.submissions || [];
                                console.log(
                                  "Submissions found:",
                                  submissions.length
                                );

                                if (submissions.length > 0) {
                                  console.log("All submissions:", submissions);
                                  const userSubmission = submissions.find(
                                    (sub) =>
                                      sub.user?._id === userId ||
                                      sub.user === userId
                                  );

                                  console.log("User submission for task:", {
                                    taskId: task._id,
                                    taskTitle: task.title,
                                    userId,
                                    foundSubmission: !!userSubmission,
                                    submission: userSubmission,
                                  });

                                  if (userSubmission) {
                                    results.push({
                                      taskId: task._id,
                                      title: task.title,
                                      score: userSubmission.score,
                                      submittedAt: new Date(
                                        userSubmission.submittedAt
                                      ).toLocaleDateString(),
                                      passed: userSubmission.score >= 80,
                                    });
                                  }
                                }
                              } catch (taskError) {
                                console.error(
                                  `Error processing task ${task._id}:`,
                                  taskError
                                );
                              }
                            }

                            console.log("Final results:", results);

                            if (results.length === 0) {
                              // Log more details about why no results were found
                              console.warn(
                                "No submissions found. Checking task data..."
                              );
                              const tasks = sessionTasks[session._id] || [];
                              tasks.forEach((task) => {
                                console.log(
                                  `Task ${task._id} (${task.title}):`,
                                  "Has submissions:",
                                  !!task.submissions?.length,
                                  "Submissions:",
                                  task.submissions
                                );
                              });
                            }

                            setCurrentResults({
                              sessionTitle: session.title,
                              results,
                            });
                            setResultsModalVisible(true);
                          } catch (error) {
                            console.error("Error fetching results:", error);
                            message.error("Failed to load test results");
                          }
                        }}
                      >
                        View Results
                      </Button>
                    </div>

                    {loadingTasks[session._id] ? (
                      <div className="p-4 text-center">
                        <Skeleton active paragraph={{ rows: 1 }} />
                      </div>
                    ) : sessionTasks[session._id]?.length > 0 ? (
                      <div className="space-y-2">
                        {sessionTasks[session._id]?.map((task, taskIndex) => {
                          const isUnlocked = isTaskUnlocked(
                            taskIndex,
                            sessionTasks[session._id],
                            sessions.findIndex((s) => s._id === session._id),
                            sessions
                          );
                          const isCompleted = isTaskCompleted(task);

                          return (
                            <div
                              key={task._id}
                              className={`p-4 rounded-lg transition-all duration-200 ${
                                isCompleted
                                  ? "bg-gray-200 dark:bg-[#001529] border-l-4 border-green-500"
                                  : !isUnlocked
                                  ? "bg-gray-200 dark:bg-[#001529] border-l-4 border-gray-300 opacity-75"
                                  : "bg-gray-200 dark:bg-[#001529] border-l-4 border-blue-500 hover:bg-blue-50 cursor-pointer shadow-sm hover:shadow-md"
                              }`}
                              onClick={
                                isUnlocked && !isCompleted
                                  ? (e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/lms/courses/${courseId}/sprints/${sprintId}/sessions/${session._id}/tasks/${task._id}`
                                      );
                                    }
                                  : undefined
                              }
                            >
                              <div className="flex justify-between items-start">
                                <div className="font-medium text-black dark:text-white">
                                  {task.title}
                                  {isTaskCompleted(task) && (
                                    <span className="ml-2 text-green-600 text-sm">
                                      <CheckOutlined /> Completed
                                    </span>
                                  )}
                                </div>
                                {isTaskCompleted(task) && (
                                  <Tag
                                    color="green"
                                    className="flex items-center"
                                  >
                                    <LockOutlined className="mr-1" /> Locked
                                  </Tag>
                                )}
                              </div>
                              {task.description && (
                                <div className="text-black dark:text-white text-sm mt-1">
                                  {task.description}
                                </div>
                              )}
                              <div className="mt-2 flex items-center space-x-2">
                                {task.questions?.length > 0 && (
                                  <Tag
                                    color={
                                      isTaskCompleted(task) ? "green" : "blue"
                                    }
                                    className="cursor-pointer hover:opacity-80 transition"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentQuestions(task.questions);
                                      setQuestionsModalVisible(true);
                                    }}
                                  >
                                    {task.questions.length} question
                                    {task.questions.length !== 1 ? "s" : ""}
                                  </Tag>
                                )}
                                {!isUnlocked && !isTaskCompleted(task) && (
                                  <Tag
                                    color="default"
                                    className="text-xs bg-gray-100 text-gray-600"
                                  >
                                    <LockOutlined className="mr-1" /> Complete
                                    previous task
                                  </Tag>
                                )}
                                {isUnlocked && !isTaskCompleted(task) && (
                                  <span className="text-xs text-gray-500">
                                    Click to start
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <Empty
                        description="No tasks available"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        className="py-4"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Results Modal */}
      <Modal
        title={`Test Results - ${currentResults?.sessionTitle || ""}`}
        open={resultsModalVisible}
        onCancel={() => setResultsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {currentResults?.results?.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={currentResults.results}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <span
                    key="score"
                    className={
                      item.passed
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {item.score}%
                  </span>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center">
                      {item.passed ? (
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                      ) : (
                        <CloseCircleOutlined className="text-red-500 mr-2" />
                      )}
                      <span>{item.title}</span>
                    </div>
                  }
                  description={`Submitted on ${item.submittedAt}`}
                />
                <div className="w-32">
                  <Progress
                    percent={item.score}
                    status={item.passed ? "success" : "exception"}
                    showInfo={false}
                    strokeWidth={8}
                  />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center py-4 text-gray-500">
            No test results found for this session.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SprintDetails;
