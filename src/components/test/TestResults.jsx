import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrophyFilled,
  CloseCircleFilled,
  HomeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const TestResults = ({ score, totalQuestions, onRetry }) => {
  const navigate = useNavigate();

  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassing = percentage >= 70; // Adjust passing score as needed

  // Dynamic colors based on result
  const themeColor = isPassing
    ? "text-green-600 bg-green-50 border-green-200"
    : "text-red-600 bg-red-50 border-red-200";
  const iconColor = isPassing ? "#16a34a" : "#dc2626"; // green-600 : red-600

  return (
    // Increased outer padding to p-6 for better spacing on edges
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      {/* Changed max-w-lg to max-w-3xl to make it significantly wider.
          Increased shadow to shadow-2xl for better depth on the larger card.
      */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden transition-all">
        {/* Increased inner padding (px-8 py-12 and sm:px-12) for better internal spacing */}
        <div className="px-8 py-12 sm:px-12 text-center flex flex-col items-center">
          {/* Result Icon */}
          <div
            className={`mb-8 p-5 rounded-full ${
              // Increased margin-bottom and padding slightly
              isPassing ? "bg-green-100" : "bg-red-100"
            } animate-bounce-slow shadow-sm`}
          >
            {isPassing ? (
              <TrophyFilled style={{ fontSize: "56px", color: iconColor }} /> // Slightly larger icon
            ) : (
              <CloseCircleFilled
                style={{ fontSize: "56px", color: iconColor }}
              />
            )}
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {" "}
            {/* Larger, bolder title */}
            {isPassing ? "Congratulations!" : "Keep Practicing"}
          </h1>

          <p className="text-gray-600 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            {" "}
            {/* Larger text, wider max-width constraint */}
            {isPassing
              ? "You have successfully passed the scholarship evaluation. Excellent work!"
              : "You didn't meet the passing criteria this time. Don't give up, review the material and try again."}
          </p>

          {/* Score Card - Wider with more padding */}
          <div
            className={`w-full max-w-xl py-8 rounded-2xl border ${themeColor} mb-10 shadow-sm`}
          >
            <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">
              Your Final Score
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span
                className={`text-6xl font-black ${
                  isPassing ? "text-green-600" : "text-red-600"
                }`}
              >
                {score}
              </span>
              <span className="text-gray-400 font-semibold text-3xl">
                / {totalQuestions}
              </span>
            </div>
            <div className="mt-4">
              <span
                className={`inline-block px-4 py-2 rounded-full text-base font-bold shadow-sm ${
                  isPassing
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {percentage}% Score
              </span>
            </div>
          </div>

          {/* Action Buttons - Wider and taller */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
            <button
              onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-3 py-4 px-6 border-2 border-gray-200 shadow-sm text-base font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <HomeOutlined style={{ fontSize: "18px" }} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
