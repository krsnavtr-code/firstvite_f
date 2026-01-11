import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getTestQuestions, submitTestAnswers } from "../../api/testService";
import TestQuestion from "../../components/test/TestQuestion";
import TestResults from "../../components/test/TestResults";
import TestReview from "../../components/test/TestReview";

const usePreventNavigation = (prevent, handleSubmit) => {
  useEffect(() => {
    // Define all functions first
    const handleBeforeUnload = (e) => {
      if (!warningShown) {
        e.preventDefault();
        const message = "Are you sure you want to leave? Your test progress will be lost.";
        e.returnValue = message;
        return message;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // First warning
        const firstChoice = confirm(
          '⚠️ Test Security Alert!\n\n' +
            'You have switched away from the test window.\n' +
            'This is a violation of test rules.\n\n' +
            'Click OK to submit the test now.\n' +
            'Click Cancel to restart the test.'
        );

        if (firstChoice) {
          // Second confirmation
          const finalConfirm = confirm(
            '❗ Final Confirmation\n\n' +
              'Are you sure you want to submit the test?\n\n' +
              'This action cannot be undone.'
          );

          if (finalConfirm && handleSubmit) {
            handleSubmit(true); // force submit
          }
        } else {
          // Cancel → Reload test
          alert('⚠️ Test will restart now.');
          window.location.reload();
        }
      } else {
        document.title = originalTitle;
      }
    };

    const disableShortcuts = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "J" || e.key === "C")) ||
        e.key === "F12" ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        return false;
      }
    };

    if (!prevent) {
      // Clean up any existing event listeners if they exist
      const cleanup = () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('contextmenu', (e) => e.preventDefault());
        document.removeEventListener('keydown', disableShortcuts);
      };
      return cleanup;
    }

    // Store the original page title
    const originalTitle = document.title;
    let warningShown = false;

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", disableShortcuts);

    // Add a confirmation dialog for test reset
    const handleResetWarning = (e) => {
      if (
        !confirm(
          "Are you sure you want to reset your test? All progress will be lost."
        )
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    // Listen for test reset attempts
    const testResetButtons = document.querySelectorAll(
      'button[onclick*="resetTest"], button[class*="reset"]'
    );
    testResetButtons.forEach((button) => {
      button.addEventListener("click", handleResetWarning);
    });

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
      document.removeEventListener("keydown", disableShortcuts);
      testResetButtons.forEach((button) => {
        button.removeEventListener("click", handleResetWarning);
      });
      document.title = originalTitle;
    };
  }, [prevent]);
};

// Icons (Keeping these from your original code)
import {
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleFilled,
  TrophyFilled,
  SafetyCertificateFilled,
  WarningOutlined,
} from "@ant-design/icons";

const QUESTION_TIME_LIMIT = 5;

const ScholarshipTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // State declarations first
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [agreed, setAgreed] = useState(false);
  const timerRef = useRef(null);

  // Define handleSubmit first
  const handleSubmit = useCallback(async (finalSubmit = false) => {
    try {
      if (!finalSubmit) {
        setShowReview(true);
        return;
      }
      
      setIsLoading(true);
      const result = await submitTestAnswers(answers);
      setScore(result.score);
      setTestCompleted(true);
      setShowReview(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (error) {
      console.error("Error submitting test:", error);
    } finally {
      setIsLoading(false);
    }
  }, [answers]);

  // Prevent navigation when test is in progress, questions are loaded, and not in review
  usePreventNavigation(
    testStarted && 
    !testCompleted && 
    !showReview && 
    questions.length > 0 && 
    !isLoading, 
    handleSubmit
  );
  
  const handleBackToTest = () => {
    setShowReview(false);
  };

  const handleTimeUp = useCallback(() => {
    if (questions.length === 0) return;
    
    // Auto-submit if it's the last question
    if (currentQuestionIndex >= questions.length - 1) {
      handleSubmit();
      return;
    }
    
    // Move to next question when time is up, regardless of whether current question is answered
    setCurrentQuestionIndex((prev) => {
      const nextIndex = prev + 1;
      // Mark current question as unanswered if not answered
      const currentQuestion = questions[prev];
      if (currentQuestion && !answers[currentQuestion.id]) {
        setAnswers(prevAnswers => ({
          ...prevAnswers,
          [currentQuestion.id]: 'unanswered'
        }));
      }
      return nextIndex;
    });
    setTimeLeft(QUESTION_TIME_LIMIT); // Reset timer for the next question
  }, [currentQuestionIndex, questions, answers, handleSubmit]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(QUESTION_TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [handleTimeUp]);

  useEffect(() => {
    if (questions.length > 0 && testStarted && !testCompleted) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    currentQuestionIndex,
    questions.length,
    startTimer,
    testStarted,
    testCompleted,
  ]);

  useEffect(() => {
    // Block browser back/forward navigation
    const unblock = history.pushState(null, "", location.pathname);

    const fetchQuestions = async () => {
      try {
        const data = await getTestQuestions();
        setQuestions(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching test questions:", error);
        setIsLoading(false);
      }
    };

    fetchQuestions();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (unblock) unblock();
    };
  }, [location]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentQuestionId = currentQuestion._id;
    
    if (currentQuestionIndex < questions.length - 1) {
      if (answers[currentQuestionId] !== undefined) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTimeLeft(QUESTION_TIME_LIMIT); // Reset timer for the next question
      } else {
        // Show error or notification that answer is required
        alert('Please select an answer before proceeding to the next question.');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setTimeLeft(QUESTION_TIME_LIMIT); // Reset timer when going back
    }
  };

  // --- Render Sections ---

  // 1. Loading
  if (isLoading && !testCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-5">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="text-gray-600 font-medium text-lg">
            Preparing your assessment...
          </p>
        </div>
      </div>
    );
  }

  // 2. Result Screen
  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-5">
        <TestResults
          score={score}
          totalQuestions={questions.length}
          onRetry={() => {
            setTestStarted(false);
            setTestCompleted(false);
            setScore(0);
            setAnswers({});
            setCurrentQuestionIndex(0);
            setAgreed(false);
          }}
        />
      </div>
    );
  }

  // 3. Instructions Screen
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-5">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <SafetyCertificateFilled
                style={{ fontSize: "48px", color: "#4f46e5" }}
              />
              <h2 className="text-3xl font-bold text-gray-900 mt-4">
                Scholarship Evaluation
              </h2>
              <p className="text-gray-500 mt-2">
                Please review the guidelines below before proceeding.
              </p>
            </div>

            {/* Warning Alert */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 flex items-start gap-3">
              <WarningOutlined className="text-orange-500 text-xl mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800">
                  Time Constraint
                </h4>
                <p className="text-orange-700 text-sm mt-1">
                  You have strictly {QUESTION_TIME_LIMIT} seconds per question.
                  The test will auto-advance if time runs out.
                </p>
              </div>
            </div>

            {/* Rules Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Rules & Regulations
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 leading-relaxed">
                <li>Ensure a stable internet connection.</li>
                <li>Do not refresh the page or switch tabs.</li>
                <li>Questions cannot be revisited once submitted.</li>
                <li>Malpractice checks are active.</li>
              </ul>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <label className="flex items-center gap-3 cursor-pointer mb-6 group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  I understand and agree to the rules.
                </span>
              </label>

              <button
                disabled={!agreed}
                onClick={() => setTestStarted(true)}
                className={`w-full py-4 rounded-full text-lg font-semibold transition-all duration-200 
                  ${
                    agreed
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Review Screen
  if (showReview) {
    return (
      <TestReview 
        questions={questions}
        answers={answers}
        onBack={handleBackToTest}
        onSubmit={() => handleSubmit(true)}
      />
    );
  }

  // 5. Active Test Interface
  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / questions.length) * 100
  );

  const isTimeCritical = timeLeft <= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Header Section */}
        <div className="p-6 md:p-8 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-700">
              Question {currentQuestionIndex + 1}
              <span className="text-gray-400 font-normal ml-1">
                / {questions.length}
              </span>
            </h3>

            {/* Timer Badge */}
            <div
              className={`px-4 py-1.5 rounded-full flex items-center gap-2 border font-bold transition-all duration-300
              ${
                isTimeCritical
                  ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              <ClockCircleOutlined />
              <span className="tabular-nums">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
          {questions.length > 0 && (
            <TestQuestion
              question={questions[currentQuestionIndex]}
              onAnswer={handleAnswer}
              selectedAnswer={answers[questions[currentQuestionIndex]._id]}
            />
          )}
        </div>

        <div className="h-px bg-gray-100 mx-8" />

        {/* Footer Actions */}
        <div className="p-6 md:p-8 flex justify-between items-center bg-white">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors
              ${
                currentQuestionIndex === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            <LeftOutlined style={{ fontSize: "14px" }} />
            Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[questions[currentQuestionIndex]?._id]}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all shadow-md ${
                answers[questions[currentQuestionIndex]?._id]
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next Question
              <RightOutlined style={{ fontSize: "14px" }} />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={isLoading || !answers[questions[currentQuestionIndex]?._id]}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all shadow-md ${
                answers[questions[currentQuestionIndex]?._id] && !isLoading
                  ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircleFilled />
              Review Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipTest;
