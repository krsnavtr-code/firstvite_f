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
  MessageOutlined,
} from "@ant-design/icons";
import { getSessionsBySprint } from "../../api/sessionApi";
import { getTasksBySession } from "../../api/taskApi";
import { getTask } from "../../api/taskApi";
import { getSprintById } from "../../api/sprintApi";
import { useAuth } from "../../contexts/AuthContext";
import { useLMS } from "../../contexts/LMSContext";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const SprintDetails = () => {
  const { courseId, sprintId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [sprint, setSprint] = useState(null);
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
  const { enrollments } = useLMS();

  // Get user ID safely
  const getUserId = () => {
    const userId = currentUser?._id || localStorage.getItem("userId");
    return userId;
  };

  // Get batch information from enrollment
  const getBatch = () => {
    const enrollment = enrollments.find((e) => e.course._id === courseId);
    return enrollment?.batch || null;
  };

  // Check if task has been attempted by user (locked if any submission exists)
  const isTaskCompleted = (task) => {
    if (!task?.submissions?.length) return false;
    const userId = getUserId();
    return task.submissions.some(
      (sub) => sub.user?._id === userId || sub.user === userId,
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

  // Check if sprint has started based on its start date
  const isSprintStarted = () => {
    if (!sprint) return false;
    if (!sprint.startDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(sprint.startDate);
    startDate.setHours(0, 0, 0, 0);
    return today >= startDate;
  };

  // Check if a task should be unlocked
  const isTaskUnlocked = (taskIndex, tasks, sessionIndex, allSessions) => {
    // If sprint hasn't started yet, all tasks are locked
    if (!isSprintStarted()) return false;

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

        // Fetch sprint details to check start date
        try {
          const sprintResponse = await getSprintById(sprintId);
          const sprintData =
            sprintResponse?.data?.sprint ||
            sprintResponse?.data ||
            sprintResponse;
          if (sprintData) {
            setSprint(sprintData);
          }
        } catch (sprintError) {
          console.error("Error fetching sprint details:", sprintError);
        }

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
                error,
              );
              return { sessionId: session._id, tasks: [] };
            }),
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
    <div className="max-w-7xl mx-auto px-2 py-2 md:py-4 space-y-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/smart-board/courses/${courseId}`)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl shadow-sm transition-all duration-300"
      >
        <ArrowLeftOutlined className="text-xs" />
        Back to Course Curriculum
      </button>

      {/* Hero Sprint Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
              Sprint Dashboard
            </span>
            {sprint?.startDate && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border ${
                  !isSprintStarted()
                    ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                    : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                }`}
              >
                <LockOutlined className="text-xs" />
                {!isSprintStarted() ? "Scheduled" : "Active"}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-tight">
            {sprint?.name || "Sprint Sessions"}
          </h1>
          {sprint?.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl">
              {sprint.description}
            </p>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 w-full md:w-auto justify-between md:justify-start">
            <div className="text-right">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">
                Sprint Progress
              </p>
              <p className="text-sm font-black text-slate-700 dark:text-white capitalize">
                {getSprintStatus().status.replace("_", " ")}
              </p>
            </div>
            <Progress
              type="circle"
              percent={getSprintStatus().progress}
              width={50}
              strokeWidth={10}
              format={(percent) => `${percent}%`}
              status={
                getSprintStatus().status === "completed" ? "success" : "active"
              }
              className="[&_.ant-progress-text]:text-slate-800 dark:[&_.ant-progress-text]:text-white [&_.ant-progress-text]:font-black [&_.ant-progress-text]:text-[10px]"
            />
          </div>
        )}
      </div>

      {/* Sessions Accordion List */}
      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <Empty description="No sessions published yet for this sprint." />
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isUnlocked = isSessionUnlocked(
              sessions.findIndex((s) => s._id === session._id),
              sessions,
            );

            return (
              <div
                key={session._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Session Header Card */}
                <div
                  className={`p-4 md:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-colors ${
                    isUnlocked
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer border-l-4 border-l-blue-500"
                      : "bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 cursor-not-allowed border-l-4 border-l-slate-200 dark:border-l-slate-800"
                  }`}
                  onClick={() => {
                    if (isUnlocked) {
                      toggleSession(session._id);
                    }
                  }}
                >
                  <div className="flex items-center gap-4 flex-1 w-full">
                    {(() => {
                      const sessionTasksList = sessionTasks[session._id] || [];
                      const completedTasks = sessionTasksList.filter((task) =>
                        isTaskCompleted(task),
                      );
                      const completionPercentage =
                        sessionTasksList.length > 0
                          ? Math.round(
                              (completedTasks.length /
                                sessionTasksList.length) *
                                100,
                            )
                          : 0;
                      const isCompleted =
                        areAllTasksCompleted(sessionTasksList);
                      const inProgress =
                        completedTasks.length > 0 && !isCompleted;

                      // Determine icon to show
                      let icon = (
                        <PlayCircleOutlined className="text-blue-500 text-xl" />
                      );

                      if (isCompleted) {
                        icon = (
                          <CheckCircleOutlined className="text-green-500 text-xl" />
                        );
                      } else if (inProgress) {
                        icon = (
                          <div className="relative flex items-center justify-center">
                            <PlayCircleOutlined className="text-blue-500 text-xl" />
                            <div className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-blue-500 rounded-full flex items-center justify-center px-0.5">
                              <span className="text-white text-[8px] font-black leading-none">
                                {completionPercentage}
                              </span>
                            </div>
                          </div>
                        );
                      } else if (!isUnlocked) {
                        icon = (
                          <LockOutlined className="text-slate-400 dark:text-slate-500 text-xl" />
                        );
                      }

                      return (
                        <>
                          <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-300">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-base font-bold text-slate-800 dark:text-white line-clamp-1 pr-4">
                                {session.name}
                              </h3>
                              {sessionTasksList.length > 0 && (
                                <Tag
                                  color={
                                    isCompleted
                                      ? "success"
                                      : inProgress
                                        ? "processing"
                                        : "default"
                                  }
                                  className="text-[10px] font-bold uppercase tracking-wider rounded-full border-0 px-2.5 py-0.5"
                                >
                                  {isCompleted
                                    ? "Completed"
                                    : inProgress
                                      ? "In Progress"
                                      : "Not Started"}
                                </Tag>
                              )}
                            </div>
                            {session.content && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                {session.content}
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Right Side Controls & Video Playback */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 w-full lg:w-auto mt-3 lg:mt-0 justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-2">
                      {session.zoomMeetingLink && (
                        <a
                          href={session.zoomMeetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-700/10 rounded-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                        >
                          <VideoCameraOutlined className="text-sm" />
                          Go Live
                        </a>
                      )}

                      {getBatch()?.whatsappGroupLink && (
                        <a
                          href={getBatch().whatsappGroupLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-700/10 rounded-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                        >
                          <MessageOutlined className="text-sm" />
                          Group
                        </a>
                      )}

                      {session.videoUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentVideoUrl(session.videoUrl);
                            setVideoModalVisible(true);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                        >
                          <PlayCircleOutlined className="text-sm" />
                          Watch Video
                        </button>
                      )}
                    </div>

                    <div className="p-1.5 text-slate-400 dark:text-slate-500 self-center">
                      {expandedSessions[session._id] ? (
                        <DownOutlined className="text-xs font-black" />
                      ) : (
                        <RightOutlined className="text-xs font-black" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Session expanded tasks area */}
                {expandedSessions[session._id] && (
                  <div
                    className={`border-t border-slate-150 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-4 md:p-6 transition-all ${
                      !isUnlocked ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center">
                        <FileTextOutlined className="mr-2 text-slate-400" />
                        Session Tasks
                      </h4>
                      <Button
                        type="link"
                        size="small"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-xs"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const userId = getUserId();
                            if (!userId) {
                              message.error(
                                "Please log in to view test results.",
                              );
                              return;
                            }

                            const tasks = sessionTasks[session._id] || [];
                            const results = [];

                            // Get submissions for each task
                            for (const task of tasks) {
                              try {
                                const response = await getTask(task._id);
                                const taskData =
                                  response?.data?.task || response?.task;
                                const submissions = taskData?.submissions || [];

                                if (submissions.length > 0) {
                                  const userSubmission = submissions.find(
                                    (sub) =>
                                      sub.user?._id === userId ||
                                      sub.user === userId,
                                  );

                                  if (userSubmission) {
                                    results.push({
                                      taskId: task._id,
                                      title: task.title,
                                      score: userSubmission.score,
                                      submittedAt: new Date(
                                        userSubmission.submittedAt,
                                      ).toLocaleDateString(),
                                      passed: userSubmission.score >= 80,
                                    });
                                  }
                                }
                              } catch (taskError) {
                                console.error(
                                  `Error processing task ${task._id}:`,
                                  taskError,
                                );
                              }
                            }

                            setCurrentResults({
                              sessionTitle: session.name,
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
                      <div className="py-8 text-center">
                        <Skeleton active paragraph={{ rows: 1 }} />
                      </div>
                    ) : sessionTasks[session._id]?.length > 0 ? (
                      <div className="space-y-3">
                        {sessionTasks[session._id]?.map((task, taskIndex) => {
                          const isTaskActive = isTaskUnlocked(
                            taskIndex,
                            sessionTasks[session._id],
                            sessions.findIndex((s) => s._id === session._id),
                            sessions,
                          );
                          const isCompleted = isTaskCompleted(task);

                          return (
                            <div
                              key={task._id}
                              className={`p-4 rounded-xl border transition-all duration-300 ${
                                isCompleted
                                  ? "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 border-l-4 border-l-green-500 shadow-sm"
                                  : !isTaskActive
                                    ? "bg-slate-100/50 dark:bg-slate-800/20 border-slate-200/50 dark:border-slate-800/50 border-l-4 border-l-slate-300 dark:border-l-slate-700 opacity-60 cursor-not-allowed"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-l-4 border-l-blue-500 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md cursor-pointer hover:bg-blue-50/10 dark:hover:bg-blue-900/5"
                              }`}
                              onClick={
                                isTaskActive && !isCompleted
                                  ? (e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/smart-board/courses/${courseId}/sprints/${sprintId}/sessions/${session._id}/tasks/${task._id}`,
                                      );
                                    }
                                  : undefined
                              }
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="font-bold text-slate-800 dark:text-white flex flex-wrap items-center gap-2 text-sm md:text-base">
                                  <span>{task.title}</span>
                                  {isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-md border border-green-200/20">
                                      <CheckOutlined /> Completed
                                    </span>
                                  )}
                                </div>
                                {isCompleted && (
                                  <Tag
                                    color="green"
                                    className="flex items-center rounded-full border-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm"
                                  >
                                    <LockOutlined className="mr-1 text-[10px]" />{" "}
                                    Locked
                                  </Tag>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {task.questions?.length > 0 && (
                                  <Tag
                                    color={isCompleted ? "green" : "blue"}
                                    className="cursor-pointer hover:opacity-80 transition rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold flex items-center shadow-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isCompleted) {
                                        setCurrentQuestions(task.questions);
                                        setQuestionsModalVisible(true);
                                      } else {
                                        message.info(
                                          "Please submit the task first to view the questions Answer.",
                                        );
                                      }
                                    }}
                                  >
                                    {task.questions.length} question
                                    {task.questions.length !== 1 ? "s" : ""}
                                  </Tag>
                                )}

                                {!isTaskActive && !isCompleted && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-medium border border-slate-200/50 dark:border-slate-700/50">
                                    <LockOutlined className="text-xs" />{" "}
                                    {!isSprintStarted() && sprint?.startDate
                                      ? `Starts on ${new Date(sprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                                      : "Complete previous task"}
                                  </span>
                                )}

                                {isTaskActive && !isCompleted && (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full hover:bg-blue-100 transition shadow-sm border border-blue-100/50 dark:border-blue-900/30">
                                    Click to Start →
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <Empty
                          description="No tasks available in this session"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          className="py-2"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Video Modal */}
      <Modal
        title={
          <span className="font-bold text-slate-800 dark:text-white">
            Video Player
          </span>
        }
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
        centered
        className="[&_.ant-modal-content]:rounded-2xl dark:[&_.ant-modal-content]:bg-slate-900 dark:[&_.ant-modal-header]:bg-slate-900 dark:[&_.ant-modal-title]:text-white"
      >
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black mt-4">
          {currentVideoUrl.includes(".mp4") ||
          currentVideoUrl.includes(".mov") ||
          currentVideoUrl.includes(".webm") ? (
            <video
              src={currentVideoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              controlsList="nodownload"
            />
          ) : (
            <iframe
              src={
                currentVideoUrl.includes("drive.google.com")
                  ? currentVideoUrl
                      .replace("/view?usp=sharing", "/preview")
                      .replace("/view", "/preview")
                  : currentVideoUrl
              }
              width="100%"
              height="100%"
              allow="autoplay; fullscreen"
              allowFullScreen
              frameBorder="0"
              className="w-full h-full border-0"
            />
          )}
        </div>
      </Modal>

      {/* Questions Modal */}
      <Modal
        title={
          <span className="font-bold text-slate-800 dark:text-white text-lg">
            Questions & Answers
          </span>
        }
        open={questionsModalVisible}
        onCancel={() => setQuestionsModalVisible(false)}
        footer={null}
        width={700}
        centered
        className="[&_.ant-modal-content]:rounded-2xl dark:[&_.ant-modal-content]:bg-slate-900 dark:[&_.ant-modal-header]:bg-slate-900 dark:[&_.ant-modal-title]:text-white"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto mt-4 pr-1">
          {currentQuestions.map((question, index) => (
            <div
              key={index}
              className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm"
            >
              <div className="font-bold text-slate-800 dark:text-white mb-4 text-sm md:text-base leading-relaxed">
                {index + 1}. {question.question}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options?.map((option, optIndex) => {
                  const optionText =
                    typeof option === "object" ? option.text : option;
                  const isCorrect =
                    typeof option === "object"
                      ? option.isCorrect
                      : question.correctAnswer === optIndex;

                  return (
                    <div
                      key={optIndex}
                      className={`p-3.5 rounded-xl border flex items-start gap-2.5 transition ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                          : "bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none shrink-0 ${
                          isCorrect
                            ? "bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="text-sm font-medium leading-normal pr-1">
                        {optionText}
                      </span>
                    </div>
                  );
                })}
              </div>
              {question.explanation && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 rounded-xl text-sm leading-relaxed">
                  <strong className="font-bold text-blue-800 dark:text-blue-300 block mb-1">
                    Explanation:
                  </strong>{" "}
                  {question.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal
        title={
          <span className="font-bold text-slate-800 dark:text-white">
            Test Results - {currentResults?.sessionTitle || ""}
          </span>
        }
        open={resultsModalVisible}
        onCancel={() => setResultsModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setResultsModalVisible(false)}
            className="rounded-xl font-semibold border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
          >
            Close
          </Button>,
        ]}
        width={600}
        centered
        className="[&_.ant-modal-content]:rounded-2xl dark:[&_.ant-modal-content]:bg-slate-900 dark:[&_.ant-modal-header]:bg-slate-900 dark:[&_.ant-modal-title]:text-white"
      >
        {currentResults?.results?.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={currentResults.results}
            className="mt-4"
            renderItem={(item) => (
              <List.Item
                actions={[
                  <span
                    key="score"
                    className={`font-black text-sm pr-2 ${
                      item.passed
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.score}%
                  </span>,
                ]}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-3 py-4 rounded-xl transition"
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center gap-2">
                      {item.passed ? (
                        <CheckCircleOutlined className="text-emerald-500 text-base" />
                      ) : (
                        <CloseCircleOutlined className="text-red-500 text-base" />
                      )}
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                        {item.title}
                      </span>
                    </div>
                  }
                  description={
                    <span className="text-xs text-slate-400">
                      Submitted on {item.submittedAt}
                    </span>
                  }
                />
                <div className="w-28 md:w-36 shrink-0 hidden sm:block">
                  <Progress
                    percent={item.score}
                    status={item.passed ? "success" : "exception"}
                    showInfo={false}
                    strokeWidth={8}
                    className="m-0"
                  />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <Empty
              description="No test results found for this session."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SprintDetails;
