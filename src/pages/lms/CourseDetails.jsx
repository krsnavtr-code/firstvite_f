import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSprintsByCourse } from "../../api/sprintApi";
import { getSessionsBySprint } from "../../api/sessionApi";
import { getTasksBySession } from "../../api/taskApi";
import { useLMS } from "../../contexts/LMSContext";
import { useAuth } from "../../contexts/AuthContext";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { enrollments } = useLMS();
  const { currentUser } = useAuth();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [sprintProgress, setSprintProgress] = useState({});
  const [batch, setBatch] = useState(null);

  const isTaskCompleted = (task) => {
    if (!task?.submissions?.length) return false;
    const userId = currentUser?._id;
    return task.submissions.some(
      (sub) => sub.user?._id === userId || sub.user === userId,
    );
  };

  const areAllTasksCompleted = (tasks) => {
    if (!tasks || !tasks.length) return false;
    return tasks.every((task) => isTaskCompleted(task));
  };

  const calculateSprintProgress = (sprint) => {
    if (!sprint.tasks || !sprint.tasks.length) return 0;
    const completedTasks = sprint.tasks.filter((task) => isTaskCompleted(task));
    return Math.round((completedTasks.length / sprint.tasks.length) * 100);
  };

  useEffect(() => {
    const fetchCourseAndSprints = async () => {
      try {
        setLoading(true);
        const currentEnrollment = enrollments.find(
          (e) => e.course._id === courseId,
        );
        if (!currentEnrollment) {
          navigate("/smart-board/dashboard");
          return;
        }
        setCourse(currentEnrollment.course);
        setBatch(currentEnrollment.batch);

        const response = await getSprintsByCourse(courseId, {
          populate: "sessions tasks",
        });
        let sprintsData = response?.data?.sprints || response || [];

        const progressData = {};
        const updatedSprints = [];

        for (const sprint of sprintsData) {
          let sprintWithTasks = sprint;
          if (!sprint.tasks || !sprint.tasks.length) {
            const sessionsResponse = await getSessionsBySprint(sprint._id);
            const sessions = sessionsResponse?.data?.sessions || [];
            const allTasks = [];
            for (const session of sessions) {
              const tasksResponse = await getTasksBySession(session._id);
              if (tasksResponse?.data?.tasks)
                allTasks.push(...tasksResponse.data.tasks);
            }
            sprintWithTasks = { ...sprint, sessions, tasks: allTasks };
          }
          progressData[sprint._id] = calculateSprintProgress(sprintWithTasks);
          updatedSprints.push(sprintWithTasks);
        }
        setSprintProgress(progressData);
        setSprints(updatedSprints);
      } catch (error) {
        console.error("Error loading course details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (enrollments.length > 0 && currentUser) fetchCourseAndSprints();
  }, [courseId, enrollments, currentUser]);

  const progress = sprints.length
    ? Math.round(
        Object.values(sprintProgress).reduce((a, b) => a + b, 0) /
          sprints.length,
      )
    : 0;

  if (loading)
    return (
      <div className="p-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-6"></div>
        <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-40 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto transition-all">
      {/* Hero Course Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none mb-10">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-2/5 relative aspect-video lg:aspect-auto">
            <img
              src={course.thumbnail || ""}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"></div>
          </div>

          <div className="p-6 lg:p-10 lg:w-3/5 flex flex-col justify-center">
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${progress === 100 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
              >
                {progress === 100
                  ? "Completed"
                  : progress > 0
                    ? "In Progress"
                    : "Not Started"}
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-wider">
                {sprints.length} Sprints
              </span>
              {batch && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  {batch.name}
                </span>
              )}
            </div>

            <h1 className="text-xl font-black text-slate-800 dark:text-white mb-4 leading-tight">
              {course.title}
            </h1>

            {/* Course Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Overall Progress
                </span>
                <span className="text-lg font-black text-blue-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${progress === 100 ? "bg-green-500" : "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-right font-medium">
                {sprints.filter((s) => sprintProgress[s._id] === 100).length} of{" "}
                {sprints.length} sprints completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sprints Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg
              className="w-6 h-6"
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
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            Curriculum Sprints
          </h2>
        </div>

        {sprints.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500">
              No sprints published yet for this course.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sprints.map((sprint) => {
              const sp = sprintProgress[sprint._id] || 0;
              const isComp = sp === 100;

              return (
                <div
                  key={sprint._id}
                  onClick={() =>
                    navigate(
                      `/smart-board/courses/${courseId}/sprints/${sprint._id}`,
                    )
                  }
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 md:p-6 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                      {sprint.name}
                    </h3>
                    <div
                      className={`p-1.5 rounded-lg ${isComp ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"}`}
                    >
                      {isComp ? (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-6 line-clamp-2 h-10 leading-relaxed">
                    {sprint.goal ||
                      "Learn the fundamentals and advanced concepts in this sprint module."}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        {sprint.sessions?.length || 0} Sessions
                      </span>
                    </div>
                    {sprint.whatsappGroupLink && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(sprint.whatsappGroupLink, "_blank");
                        }}
                        className="text-green-500 hover:bg-green-50 p-2 rounded-lg transition-colors"
                        title="Join WhatsApp Group"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Individual Sprint Progress */}
                  {sp > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full transition-all duration-700 ${isComp ? "bg-green-500" : "bg-blue-600"}`}
                        style={{ width: `${sp}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
