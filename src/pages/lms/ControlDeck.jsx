import React from "react";

const ControlDeck = ({
  isAudioEnabled,
  toggleAudio,
  isVideoEnabled,
  toggleVideo,
  isScreenSharing,
  toggleScreenShare,
  isHandRaised,
  toggleHandRaise,
  showChat,
  setShowChat,
  userRole,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-2 md:gap-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 shadow-xl">
      {/* Mic */}
      <button
        onClick={toggleAudio}
        title={isAudioEnabled ? "Mute Mic" : "Unmute Mic"}
        className={`p-2.5 rounded-xl transition-all shadow-sm ${
          isAudioEnabled
            ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
            : "bg-red-600 text-white hover:bg-red-500"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={
              isAudioEnabled
                ? "M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z"
                : "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636M12 15.75a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z"
            }
          />
        </svg>
      </button>

      {/* Camera */}
      <button
        onClick={toggleVideo}
        title={isVideoEnabled ? "Stop Camera" : "Start Camera"}
        className={`p-2.5 rounded-xl transition-all shadow-sm ${
          isVideoEnabled
            ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
            : "bg-red-600 text-white hover:bg-red-500"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={
              isVideoEnabled
                ? "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 4.5 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                : "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 19.5h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 8.25v9a2.25 2.25 0 0 0 2.25 2.25Z m3 3 18 18"
            }
          />
        </svg>
      </button>

      {/* Screen Share - only for teachers */}
      {userRole === "teacher" && (
        <button
          onClick={toggleScreenShare}
          title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          className={`p-2.5 rounded-xl transition-all shadow-sm ${
            isScreenSharing
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15.75V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z"
            />
          </svg>
        </button>
      )}

      {/* Hand Raise */}
      {userRole === "student" && (
        <button
          onClick={toggleHandRaise}
          title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          className={`p-2.5 rounded-xl transition-all shadow-sm ${
            isHandRaised
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.05 4.575a1.5 1.5 0 1 1 3 0V9.75M4.5 10.5a1.5 1.5 0 1 1 3 0v5.625M7.5 7.875a1.5 1.5 0 1 1 3 0v6.75m6.75-3a1.5 1.5 0 0 1 3 0v3.375c0 4.349-4.03 7.875-9 7.875a11.96 11.96 0 0 1-7.5-2.656V16.5A1.5 1.5 0 0 1 10.05 15"
            />
          </svg>
        </button>
      )}

      {/* Chat */}
      <button
        onClick={() => setShowChat(!showChat)}
        title="Toggle Chat"
        className={`p-2.5 rounded-xl transition-all shadow-sm ${
          showChat
            ? "bg-blue-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
      </button>
    </div>
  );
};

export default ControlDeck;
