import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createClassroomSession,
  getBatchClassroomSessions,
  startClassroomSession,
  endClassroomSession,
  deleteClassroomSession,
} from "../../api/classroomApi";
import { getBatches } from "../../api/batchApi";
import { useAuth } from "../../contexts/AuthContext";

const ClassroomSessions = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [formData, setFormData] = useState({
    batchId: "",
    startTime: "",
    duration: 60,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchSessions(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const response = await getBatches();
      const batchesData = response?.data || response || [];

      let filteredBatches = batchesData;
      if (currentUser?.role === "teacher") {
        filteredBatches = batchesData.filter(
          (batch) => batch.teacher?._id === currentUser._id,
        );
      }

      setBatches(filteredBatches);

      if (filteredBatches.length > 0) {
        setSelectedBatch(filteredBatches[0]._id);
        setFormData((prev) => ({ ...prev, batchId: filteredBatches[0]._id }));
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      alert("Failed to fetch batches");
    }
  };

  const fetchSessions = async (batchId) => {
    try {
      setLoading(true);
      const response = await getBatchClassroomSessions(batchId);
      setSessions(response?.data || response || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      alert("Failed to fetch classroom sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const sessionData = {
        batchId: formData.batchId,
        teacherId: currentUser._id,
        startTime: new Date(formData.startTime).toISOString(),
        duration: formData.duration,
      };

      const response = await createClassroomSession(sessionData);
      const session = response?.data || response;
      alert("Classroom session created successfully");
      setIsModalVisible(false);
      setFormData({ batchId: selectedBatch, startTime: "", duration: 60 });
      fetchSessions(formData.batchId);

      // Show invite modal with the session data
      setShowInviteModal(session);
    } catch (error) {
      console.error("Error creating session:", error);
      alert(
        error.response?.data?.message || "Failed to create classroom session",
      );
    }
  };

  const handleStartSession = async (sessionId) => {
    try {
      await startClassroomSession(sessionId);
      alert("Classroom session started");
      fetchSessions(selectedBatch);
    } catch (error) {
      console.error("Error starting session:", error);
      alert(
        error.response?.data?.message || "Failed to start classroom session",
      );
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      await endClassroomSession(sessionId);
      alert("Classroom session ended");
      fetchSessions(selectedBatch);
    } catch (error) {
      console.error("Error ending session:", error);
      alert(error.response?.data?.message || "Failed to end classroom session");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteClassroomSession(sessionId);
      alert("Classroom session deleted");
      setShowDeleteConfirm(null);
      fetchSessions(selectedBatch);
    } catch (error) {
      console.error("Error deleting session:", error);
      alert(
        error.response?.data?.message || "Failed to delete classroom session",
      );
    }
  };

  const handleJoinClassroom = (sessionId) => {
    navigate(`/smart-board/classroom/${sessionId}`);
  };

  const copyInviteLink = (inviteCode) => {
    const inviteLink = `${window.location.origin}/classroom/join/${inviteCode}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        alert("Invite link copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy link");
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: "bg-blue-100 text-blue-800",
      live: "bg-green-100 text-green-800",
      ended: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.ended}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const stats = {
    total: sessions.length,
    scheduled: sessions.filter((s) => s.status === "scheduled").length,
    live: sessions.filter((s) => s.status === "live").length,
    ended: sessions.filter((s) => s.status === "ended").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Classroom Sessions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage live classroom sessions for your batches
        </p>
      </div>

      {/* Batch Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setFormData((prev) => ({ ...prev, batchId: e.target.value }));
              }}
              className="w-64 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} ({batch.code})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsModalVisible(true)}
            disabled={!selectedBatch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Session
          </button>
        </div>
      </div>

      {/* Statistics */}
      {selectedBatch && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scheduled
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.scheduled}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Live</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.live}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ended
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.ended}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No sessions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {sessions.map((session) => {
                  const { date, time } = formatDate(session.startTime);
                  return (
                    <tr
                      key={session._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {date}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {session.duration} minutes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                        {session.participants?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {session.status === "scheduled" && (
                            <>
                              <button
                                onClick={() => handleStartSession(session._id)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                              >
                                Start
                              </button>
                              <button
                                onClick={() => setShowInviteModal(session)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                              >
                                Invite
                              </button>
                              <button
                                onClick={() =>
                                  setShowDeleteConfirm(session._id)
                                }
                                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {session.status === "live" && (
                            <>
                              <button
                                onClick={() => handleEndSession(session._id)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                              >
                                End
                              </button>
                              <button
                                onClick={() => setShowInviteModal(session)}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                              >
                                Invite
                              </button>
                              <button
                                onClick={() => handleJoinClassroom(session._id)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                              >
                                Join
                              </button>
                            </>
                          )}
                          {session.status === "ended" && (
                            <button
                              disabled
                              className="px-3 py-1.5 bg-gray-300 text-gray-600 rounded cursor-not-allowed text-sm"
                            >
                              View Recording
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create Classroom Session
              </h2>
              <form onSubmit={handleCreateSession}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Batch
                  </label>
                  <select
                    value={formData.batchId}
                    onChange={(e) =>
                      setFormData({ ...formData, batchId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  >
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name} ({batch.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Session
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalVisible(false);
                      setFormData({
                        batchId: selectedBatch,
                        startTime: "",
                        duration: 60,
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Delete Session
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this session?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteSession(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Link Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Share Classroom Invite Link
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invite Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={showInviteModal.inviteCode || ""}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => copyInviteLink(showInviteModal.inviteCode)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invite Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/classroom/join/${showInviteModal.inviteCode || ""}`}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={() => copyInviteLink(showInviteModal.inviteCode)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Share this link with students to allow them to join the
                classroom session.
              </p>
              <button
                onClick={() => setShowInviteModal(null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomSessions;
