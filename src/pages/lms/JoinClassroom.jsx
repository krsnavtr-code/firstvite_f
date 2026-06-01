import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { joinClassroomByInviteCode } from "../../api/classroomApi";
import { useAuth } from "../../contexts/AuthContext";

const JoinClassroom = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (inviteCode && isAuthenticated) {
      joinSession();
    }
  }, [inviteCode, isAuthenticated]);

  const joinSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await joinClassroomByInviteCode(inviteCode);
      const sessionData = response?.data || response;
      setSession(sessionData);
      
      // Navigate to the live classroom
      navigate(`/smart-board/classroom/${sessionData._id}`);
    } catch (err) {
      console.error("Error joining classroom:", err);
      setError(err.response?.data?.message || "Failed to join classroom");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate(`/login?redirect=/classroom/join/${inviteCode}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join Classroom
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to login to join the classroom session.
          </p>
          <button
            onClick={handleLogin}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Join
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Joining classroom...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate("/smart-board")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Redirecting to classroom...</div>
    </div>
  );
};

export default JoinClassroom;
