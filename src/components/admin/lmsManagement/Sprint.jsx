import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Sessions from "./Sessions";
import { getCourses } from "../../../api/courseApi";
import {
  createSprint,
  getSprintsByCourse,
  updateSprint,
  deleteSprint,
  getAllSprints,
} from "../../../api/sprintApi";

const Sprint = () => {
  const [courses, setCourses] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [viewingSprints, setViewingSprints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCourseError, setShowCourseError] = useState(false);

  // Form State (Replacing AntD Form)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "",
    whatsappGroupLink: "",
    isActive: true,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchSprints(selectedCourse || null);
  }, [selectedCourse]);

  const fetchSprints = async (courseId) => {
    try {
      setLoading(true);
      const response = courseId
        ? await getSprintsByCourse(courseId)
        : await getAllSprints();
      const data = response?.data?.sprints || response?.data || response || [];
      setSprints(Array.isArray(data) ? data : []);
    } catch (error) {
      setSprints([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (sprint = null) => {
    setEditingSprint(sprint);
    if (sprint) {
      setFormData({
        name: sprint.name,
        description: sprint.description || "",
        goal: sprint.goal || "",
        whatsappGroupLink: sprint.whatsappGroupLink || "",
        isActive: sprint.isActive,
        startDate: sprint.startDate
          ? dayjs(sprint.startDate).format("YYYY-MM-DD")
          : "",
        endDate: sprint.endDate
          ? dayjs(sprint.endDate).format("YYYY-MM-DD")
          : "",
      });
      setIsModalVisible(true);
    } else {
      // Check if course is selected for new sprint
      if (!selectedCourse) {
        setShowCourseError(true);
        setTimeout(() => setShowCourseError(false), 3000);
        return;
      }
      setFormData({
        name: "",
        description: "",
        goal: "",
        whatsappGroupLink: "",
        isActive: true,
        startDate: "",
        endDate: "",
      });
      setIsModalVisible(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sprintData = {
      ...formData,
      courseId: selectedCourse,
      startDate: dayjs(formData.startDate).toISOString(),
      endDate: dayjs(formData.endDate).toISOString(),
    };

    try {
      if (editingSprint) {
        await updateSprint(editingSprint._id, sprintData);
      } else {
        await createSprint(sprintData);
      }
      setIsModalVisible(false);
      fetchSprints(selectedCourse);
    } catch (error) {
      alert("Failed to save sprint.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sprint?")) {
      try {
        await deleteSprint(id);
        fetchSprints(selectedCourse);
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (viewingSprints) {
    return (
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => setViewingSprints(null)}
          className="mb-6 flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Sprints
        </button>
        <Sessions
          sprintId={viewingSprints}
          sprint={sprints.find((s) => s._id === viewingSprints)}
          onClose={() => setViewingSprints(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen transition-colors text-black">
      <div>
        <h1 className="text-3xl font-black  tracking-tight">
          Sprint Management
        </h1>
        <p className="text-slate-500 mt-1">
          Organize your course curriculum into actionable time-boxed sprints.
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 my-10">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setShowCourseError(false);
              }}
              className={`px-4 py-2 bg-white border rounded-xl outline-none focus:ring-4 transition-all ${
                showCourseError
                  ? "border-red-400 ring-4 ring-red-500/10 animate-pulse"
                  : "border-slate-200 focus:ring-blue-500/10"
              }`}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
            {showCourseError && (
              <div className="absolute -bottom-8 left-0 right-0 text-xs text-red-600 font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                Please select a course first
              </div>
            )}
          </div>

          <button
            onClick={() => openModal()}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-lg transition-all ${
              selectedCourse
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
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
            Add Sprint
          </button>
        </div>
      </div>

      {/* Sprints Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-700">
                  Sprint Details
                </th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-700">
                  Course
                </th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-700">
                  Timeline
                </th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-700">
                  Status
                </th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center animate-pulse">
                    Loading Sprints...
                  </td>
                </tr>
              ) : (
                sprints.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-5">
                      <p className="font-bold  group-hover:text-blue-600 transition-colors">
                        {s.name}
                      </p>
                      <p className="text-xs line-clamp-1 mt-1">
                        {s.goal || "No goal"}
                      </p>
                    </td>
                    <td className="p-5 text-sm text-slate-500 font-medium">
                      {s.courseId?.title || "General"}
                    </td>
                    <td className="p-5 text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-bold">
                          {dayjs(s.startDate).format("MMM D")}
                        </span>
                        <span className="text-[10px] uppercase font-black tracking-tighter">
                          to {dayjs(s.endDate).format("MMM D, YYYY")}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {s.isActive ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setViewingSprints(s._id)}
                          className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Add Sessions"
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
                              d="M4 6h16M4 12h16m-7 6h7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openModal(s)}
                          className="p-2 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
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
                          className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
          {!loading && sprints.length === 0 && (
            <div className="p-20 text-center italic">
              No sprints found for this selection.
            </div>
          )}
        </div>
      </div>

      {/* Custom Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-black  uppercase tracking-tight">
                  {editingSprint ? "Edit" : "Create New"} Sprint
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalVisible(false)}
                  className="hover:text-slate-600 transition-colors"
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

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-black uppercase t mb-2">
                    Sprint Name
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="e.g., Week 1: Fundamentals"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-500 text-white border border-slate-100 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-500 text-white border border-slate-100 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-2">
                    Sprint Goal
                  </label>
                  <textarea
                    rows="2"
                    value={formData.goal}
                    onChange={(e) =>
                      setFormData({ ...formData, goal: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none resize-none"
                    placeholder="What should be achieved?"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-blue-700">
                      Sprint Visibility
                    </span>
                    <span className="text-[10px] text-blue-400 font-medium">
                      Draft sprints won't be visible to learners
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.isActive ? "bg-blue-600" : "bg-slate-300"}`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? "translate-x-6" : ""}`}
                    ></div>
                  </button>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalVisible(false)}
                  className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                >
                  {editingSprint ? "Update Sprint" : "Create Sprint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sprint;
