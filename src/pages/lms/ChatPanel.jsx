import React from "react";

const ChatPanel = ({
  showChat,
  setShowChat,
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage,
  currentUserId,
}) => {
  if (!showChat) return null;

  return (
    <div className="fixed z-50 bottom-16 right-4 w-96 h-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-slide-up">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-bold text-sm tracking-wide text-gray-800 dark:text-gray-200">
            Classroom Feed
          </h3>
        </div>
        <button
          onClick={() => setShowChat(false)}
          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-gray-950/10">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <p className="text-xs text-gray-400">No messages yet. Say hello to the class!</p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === currentUserId ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] mb-1 px-1 text-gray-500 dark:text-gray-400 font-medium">
                {msg.sender === currentUserId ? "You" : msg.senderFullname}
              </span>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm leading-relaxed ${
                  msg.sender === currentUserId
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-tl-none"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={sendChatMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="relative flex items-center">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Message all members..."
            className="w-full pl-4 pr-12 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-gray-200 dark:focus:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="absolute right-1.5 p-1.5 bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;