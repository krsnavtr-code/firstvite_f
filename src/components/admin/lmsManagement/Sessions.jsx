import React, { useState, useEffect } from "react";
import {
  createSession,
  getSessionsBySprint,
  updateSession,
  deleteSession,
  reorderSessions,
} from "../../../api/sessionApi";
import {
  createTask,
  getTasksBySession,
  updateTask,
} from "../../../api/taskApi";
import TaskForm from "./TaskForm";

const Sessions = ({ sprintId, sprint, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Form States (Replacing AntD Form)
  const [sessionFormData, setSessionFormData] = useState({
    name: "",
    description: "",
    duration: 60,
    content: "",
    videoUrl: "",
    zoomMeetingLink: "",
    isActive: true,
    resources: [],
  });

  const handleTaskSubmit = async (taskData) => {
    try {
      setTasksLoading(true);
      if (taskData._id) {
        await updateTask(taskData._id, taskData);
      } else {
        await createTask({
          ...taskData,
          sessionId: currentSessionId,
        });
      }
      setIsTaskModalVisible(false);
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (sprintId) {
      fetchSessions();
    }
  }, [sprintId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await getSessionsBySprint(sprintId);
      if (response?.data?.sessions) setSessions(response.data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const openSessionModal = (session = null) => {
    setEditingSession(session);
    if (session) {
      setSessionFormData({
        name: session.name,
        description: session.description || "",
        duration: session.duration,
        content: session.content || "",
        videoUrl: session.videoUrl || "",
        zoomMeetingLink: session.zoomMeetingLink || "",
        isActive: session.isActive,
        resources: session.resources || [],
      });
    } else {
      setSessionFormData({
        name: "",
        description: "",
        duration: 60,
        content: "",
        videoUrl: "",
        zoomMeetingLink: "",
        isActive: true,
        resources: [],
      });
    }
    setIsSessionModalVisible(true);
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...sessionFormData, sprintId };
      if (editingSession) {
        await updateSession(editingSession._id, data);
      } else {
        await createSession(data);
      }
      setIsSessionModalVisible(false);
      fetchSessions();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        setLoading(true);
        await deleteSession(id);
        fetchSessions();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const moveSession = async (id, direction) => {
    const currentIndex = sessions.findIndex((s) => s._id === id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sessions.length) return;

    const newSessions = [...sessions];
    [newSessions[currentIndex], newSessions[newIndex]] = [
      newSessions[newIndex],
      newSessions[currentIndex],
    ];
    setSessions(newSessions);

    try {
      await reorderSessions(
        sprintId,
        newSessions.map((s, idx) => ({ id: s._id, order: idx + 1 })),
      );
    } catch (error) {
      fetchSessions();
    }
  };

  return (
    <div className="bg-white text-black rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Sprint Sessions
          </h2>
          <p className=" text-sm font-medium">
            {sprint?.name
              ? `Manage timeline and content for "${sprint.name}"`
              : sprintId
                ? "Loading sprint details..."
                : "Manage the timeline and content for this sprint."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openSessionModal()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Session
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-xs font-black uppercase tracking-widest ">
                Order
              </th>
              <th className="p-5 text-xs font-black uppercase tracking-widest ">
                Session Name
              </th>
              <th className="p-5 text-xs font-black uppercase tracking-widest ">
                Duration
              </th>
              <th className="p-5 text-xs font-black uppercase tracking-widest ">
                Status
              </th>
              <th className="p-5 text-xs font-black uppercase tracking-widest  text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && sessions.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-10 text-center  animate-pulse"
                >
                  Loading Sessions...
                </td>
              </tr>
            ) : (
              sessions.map((s, idx) => (
                <tr
                  key={s._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveSession(s._id, "up")}
                        className="p-1 text-slate-300 hover:text-blue-600 transition-colors disabled:opacity-20"
                        disabled={idx === 0}
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
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveSession(s._id, "down")}
                        className="p-1 text-slate-300 hover:text-blue-600 transition-colors disabled:opacity-20"
                        disabled={idx === sessions.length - 1}
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
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-slate-800">{s.name}</p>
                    <p className="text-xs  mt-1 line-clamp-1">
                      {s.description || "No description provided"}
                    </p>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {s.duration} min
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {s.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setCurrentSessionId(s._id);
                          setIsTaskModalVisible(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                      >
                        Tasks ({s.tasks?.length || 0})
                      </button>
                      <button
                        onClick={() => openSessionModal(s)}
                        className="p-2  hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="p-2  hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {sessions.length === 0 && !loading && (
          <div className="p-20 text-center  italic">
            No sessions found for this sprint.
          </div>
        )}
      </div>

      {/* Session Modal */}
      {isSessionModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <form onSubmit={handleSessionSubmit}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {editingSession ? "Edit Session" : "Add New Session"}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsSessionModalVisible(false)}
                  className=" hover:text-slate-600 transition-colors"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-black uppercase  mb-2">
                    Session Title
                  </label>
                  <input
                    required
                    value={sessionFormData.name}
                    onChange={(e) =>
                      setSessionFormData({
                        ...sessionFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="e.g. Introduction to React Hooks"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase  mb-2">
                      Duration (Min)
                    </label>
                    <input
                      type="number"
                      required
                      value={sessionFormData.duration}
                      onChange={(e) =>
                        setSessionFormData({
                          ...sessionFormData,
                          duration: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase  mb-2">
                      Status
                    </label>
                    <select
                      value={sessionFormData.isActive}
                      onChange={(e) =>
                        setSessionFormData({
                          ...sessionFormData,
                          isActive: e.target.value === "true",
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none appearance-none"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase  mb-2">
                    Video & Meeting Links
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-blue-500 font-bold text-[10px] uppercase">
                        Zoom
                      </span>
                      <input
                        value={sessionFormData.zoomMeetingLink}
                        onChange={(e) =>
                          setSessionFormData({
                            ...sessionFormData,
                            zoomMeetingLink: e.target.value,
                          })
                        }
                        className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
                        placeholder="Zoom URL"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-red-500 font-bold text-[10px] uppercase">
                        Record
                      </span>
                      <input
                        value={sessionFormData.videoUrl}
                        onChange={(e) =>
                          setSessionFormData({
                            ...sessionFormData,
                            videoUrl: e.target.value,
                          })
                        }
                        className="w-full pl-20 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
                        placeholder="Recorded Link"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase  mb-2">
                    Content (Supports Markdown)
                  </label>
                  <textarea
                    rows="5"
                    value={sessionFormData.content}
                    onChange={(e) =>
                      setSessionFormData({
                        ...sessionFormData,
                        content: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none resize-none transition-all"
                    placeholder="What will be covered in this session?"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSessionModalVisible(false)}
                  className="px-6 py-2.5 text-sm font-bold hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                >
                  {editingSession ? "Update Session" : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* External Task Component */}
      <TaskForm
        visible={isTaskModalVisible}
        sessionId={currentSessionId}
        onSave={handleTaskSubmit}
        onCancel={() => setIsTaskModalVisible(false)}
      />
    </div>
  );
};

export default Sessions;
