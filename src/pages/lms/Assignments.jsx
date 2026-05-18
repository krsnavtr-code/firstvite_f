import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getMyEnrollments } from "../../api/lmsApi";
import { getSprintsByCourse } from "../../api/sprintApi";
import { getSessionsBySprint } from "../../api/sessionApi";
import { getTasksBySession } from "../../api/taskApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Assignments = () => {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchText, setSearchText] = useState("");

  const userId = useMemo(
    () => currentUser?._id || localStorage.getItem("userId"),
    [currentUser],
  );

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const enrollments = await getMyEnrollments();
        const courses = Array.isArray(enrollments)
          ? enrollments.map((e) => e.course || e).filter(Boolean)
          : [];
        const allTasks = [];

        for (const course of courses) {
          const courseId = course?._id || course?.id;
          const sprintsRaw = await getSprintsByCourse(courseId);
          const sprints =
            sprintsRaw?.data?.sprints ||
            sprintsRaw?.sprints ||
            sprintsRaw ||
            [];

          for (const sprint of sprints) {
            const sessionsRaw = await getSessionsBySprint(sprint?._id);
            const sessions = sessionsRaw?.data?.sessions || sessionsRaw || [];

            for (const session of sessions) {
              try {
                const tasksRaw = await getTasksBySession(session?._id);
                const tasks = tasksRaw?.data?.tasks || tasksRaw || [];

                for (const task of tasks) {
                  const submissions = task?.submissions || [];
                  const mySub = submissions.find(
                    (s) => (s?.user?._id || s?.user) === userId,
                  );
                  const status = mySub
                    ? typeof mySub.score === "number"
                      ? "graded"
                      : "submitted"
                    : "pending";

                  allTasks.push({
                    id: task?._id || task?.id,
                    title: task?.title || "Untitled Task",
                    course: course?.title || "Course",
                    dueDate: task?.dueDate
                      ? dayjs(task.dueDate)
                      : task?.createdAt
                        ? dayjs(task.createdAt)
                        : null,
                    status,
                    grade: mySub?.score || null,
                    description:
                      task?.description || "No description provided.",
                  });
                }
              } catch (e) {
                continue;
              }
            }
          }
        }
        setAssignments(allTasks);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [userId]);

  const filtered = assignments.filter(
    (a) =>
      (filterStatus === "all" || a.status === filterStatus) &&
      (a.title.toLowerCase().includes(searchText.toLowerCase()) ||
        a.course.toLowerCase().includes(searchText.toLowerCase())),
  );

  if (loading)
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto min-h-screen transition-colors">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Review Assignments
        </h1>
        <p className="text-xs sm:text-sm">
          Track your progress and submit your session tasks.
        </p>
      </header>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <svg
            className="w-5 h-5 absolute left-3 top-3 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <select
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="graded">Graded</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 text-xs font-bold  uppercase tracking-wider">
                  Assignment
                </th>
                <th className="p-4 text-xs font-bold  uppercase tracking-wider">
                  Course
                </th>
                <th className="p-4 text-xs font-bold  uppercase tracking-wider">
                  Due Date
                </th>
                <th className="p-4 text-xs font-bold  uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-bold  uppercase tracking-wider">
                  Grade
                </th>
                <th className="p-4 text-xs font-bold  uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <button
                      onClick={() => {
                        setSelectedAssignment(item);
                        setIsModalVisible(true);
                      }}
                      className="font-bold text-slate-800 dark:text-white hover:text-blue-600 text-sm"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="p-4 text-sm ">{item.course}</td>
                  <td className="p-4">
                    <div className="text-sm font-medium dark:text-slate-300">
                      {item.dueDate?.format("MMM D, YYYY") || "No date"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.dueDate ? dayjs().to(item.dueDate) : ""}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${
                        item.status === "graded"
                          ? "bg-green-100 text-green-700"
                          : item.status === "submitted"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-sm dark:text-slate-200">
                    {item.grade ? `${item.grade}/100` : "-"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        setSelectedAssignment(item);
                        setIsModalVisible(true);
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      {item.status === "pending" ? "Submit" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-20 text-center text-slate-400">
              <svg
                className="w-12 h-12 mx-auto mb-4 opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              No assignments found.
            </div>
          )}
        </div>
      </div>

      {/* Custom Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                {selectedAssignment?.title}
              </h2>
              <button
                onClick={() => setIsModalVisible(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l18 18"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                    Course
                  </p>
                  <p className="font-bold dark:text-white">
                    {selectedAssignment?.course}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                    Due Date
                  </p>
                  <p className="font-bold dark:text-white">
                    {selectedAssignment?.dueDate?.format("dddd, MMMM D, YYYY")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">
                  Instructions
                </p>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedAssignment?.description}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsModalVisible(false)}
                className="px-6 py-2 text-sm font-bold  hover:text-slate-700"
              >
                Close
              </button>
              {selectedAssignment?.status === "pending" && (
                <button
                  onClick={() => setIsModalVisible(false)}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  Submit Work
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
