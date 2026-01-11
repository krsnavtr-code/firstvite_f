import React, { useState, useEffect } from "react";
import {
  CheckCircleFilled,
  FileTextOutlined,
  LeftOutlined,
  SendOutlined,
  WarningFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";

const TestReview = ({ questions, answers, onBack, onSubmit }) => {

   const [timeLeft, setTimeLeft] = useState(60); // 60 seconds = 1 minute
   // Countdown timer
   useEffect(() => {
     if (timeLeft === 0) {
       onSubmit();
       return;
     }
     const timer = setTimeout(() => {
       setTimeLeft(timeLeft - 1);
     }, 1000);
     return () => clearTimeout(timer);
   }, [timeLeft, onSubmit]);
   // Format time as MM:SS
   const formatTime = (seconds) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };
  
  // --- Helpers ---
  const getAnswerText = (answer) => {
    if (!answer) return null; // Return null to handle UI logic separately
    if (answer === "unanswered") return null;
    if (Array.isArray(answer)) {
      return answer.length > 0 ? answer.join(", ") : null;
    }
    return answer;
  };

  const getQuestionText = (question) => {
    // Check various possible fields that might contain the question text
    if (question.questionText) return question.questionText;
    if (question.text) return question.text;
    if (question.question) return question.question;
    if (question.title) return question.title;
    if (question.content) return question.content;
    return `Question ${question._id || ""}`;
  };

  const isQuestionAnswered = (questionId) => {
    const ans = answers[questionId];
    return (
      ans &&
      ans !== "unanswered" &&
      (Array.isArray(ans) ? ans.length > 0 : true)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* --- Header --- */}
        <div className="bg-white border-b border-gray-100 p-6 md:p-8 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <FileTextOutlined style={{ fontSize: "24px" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Review Summary
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Please review your answers carefully before final submission.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg">
              <ClockCircleOutlined />
              <span className="font-semibold">
                Time remaining: {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* --- Scrollable Questions List --- */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50 space-y-6">
          {questions.map((question, index) => {
            const answer = answers[question._id];
            const hasAnswer = isQuestionAnswered(question._id);
            const answerText = getAnswerText(answer);

            return (
              <div
                key={question._id || index}
                className={`bg-white rounded-xl border p-6 transition-all duration-200 
                  ${
                    hasAnswer
                      ? "border-gray-200"
                      : "border-orange-200 shadow-sm"
                  }`}
              >
                {/* Question Header & Status */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800 leading-snug pt-0.5">
                      {getQuestionText(question)}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5
                    ${
                      hasAnswer
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-orange-50 text-orange-700 border border-orange-100"
                    }`}
                  >
                    {hasAnswer ? (
                      <>
                        <CheckCircleFilled /> Answered
                      </>
                    ) : (
                      <>
                        <WarningFilled /> Skipped
                      </>
                    )}
                  </div>
                </div>

                {/* --- Answer Display Logic --- */}
                <div className="pl-11">
                  {/* Scenario A: Question has Options (Multiple Choice/Checkbox) */}
                  {question.options && question.options.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {question.options.map((option, optIndex) => {
                        // Check if this specific option is selected
                        const isSelected = Array.isArray(answer)
                          ? answer.includes(option.text)
                          : answer === option.text;

                        return (
                          <div
                            key={optIndex}
                            className={`px-4 py-3 rounded-lg text-sm flex items-center justify-between border transition-all
                              ${
                                isSelected
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-900 font-medium shadow-sm"
                                  : "bg-gray-50 border-transparent text-gray-500 opacity-60"
                              }`}
                          >
                            <span>{option.text}</span>
                            {isSelected && (
                              <CheckCircleFilled className="text-indigo-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Scenario B: Text Input / Essay */
                    <div className="relative">
                      {hasAnswer ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 italic">
                          "{answerText}"
                        </div>
                      ) : (
                        <div className="text-orange-500 text-sm font-medium flex items-center gap-2">
                          <WarningFilled /> No answer provided for this
                          question.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Footer Actions --- */}
        <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 sticky bottom-0 z-10">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <LeftOutlined />
            Go Back & Edit
          </button>

          <button
            onClick={onSubmit}
            className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Final Submit
            <SendOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestReview;
