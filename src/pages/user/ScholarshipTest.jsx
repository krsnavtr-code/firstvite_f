import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getTestQuestions,
  submitTestAnswers,
  hasUserTakenTest,
} from "../../api/testService";
import TestQuestion from "../../components/test/TestQuestion";
import TestResults from "../../components/test/TestResults";
import TestReview from "../../components/test/TestReview";
import { message } from "antd"; // Ensure message is imported

// Icons
import {
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleFilled,
  SafetyCertificateFilled,
  WarningOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

// ... (Keep the usePreventNavigation hook exactly as it was) ...
const usePreventNavigation = (prevent, handleSubmit) => {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!warningShown) {
        e.preventDefault();
        const message =
          "Are you sure you want to leave? Your test progress will be lost.";
        e.returnValue = message;
        return message;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const firstChoice = confirm(
          "⚠️ Test Security Alert!\n\n" +
            "You have switched away from the test window.\n" +
            "This is a violation of test rules.\n\n" +
            "Click OK to submit the test now.\n" +
            "Click Cancel to restart the test."
        );

        if (firstChoice) {
          const finalConfirm = confirm(
            "❗ Final Confirmation\n\n" +
              "Are you sure you want to submit the test?\n\n" +
              "This action cannot be undone."
          );

          if (finalConfirm && handleSubmit) {
            handleSubmit(true);
          }
        } else {
          alert("⚠️ Test will restart now.");
          window.location.reload();
        }
      } else {
        document.title = originalTitle;
      }
    };

    const disableShortcuts = (e) => {
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
      const cleanup = () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("visibilitychange", handleVisibilityChange);
        document.removeEventListener("contextmenu", (e) => e.preventDefault());
        document.removeEventListener("keydown", disableShortcuts);
      };
      return cleanup;
    }

    const originalTitle = document.title;
    let warningShown = false;

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", disableShortcuts);

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

    const testResetButtons = document.querySelectorAll(
      'button[onclick*="resetTest"], button[class*="reset"]'
    );
    testResetButtons.forEach((button) => {
      button.addEventListener("click", handleResetWarning);
    });

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

const QUESTION_TIME_LIMIT = 25;

const ScholarshipTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // State
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
  const [hasTakenTest, setHasTakenTest] = useState(false);
  const [checkingTestStatus, setCheckingTestStatus] = useState(true);
  const timerRef = useRef(null);

  // --- Check Status ---
  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { state: { from: "/test" } });
      return;
    }
    const checkTestStatus = async () => {
      try {
        const hasTaken = await hasUserTakenTest();
        setHasTakenTest(hasTaken);
      } catch (error) {
        console.error("Error checking test status:", error);
      } finally {
        setCheckingTestStatus(false);
      }
    };
    checkTestStatus();
  }, [currentUser, navigate]);

  // --- Submit Logic ---
  const handleSubmit = useCallback(
    async (finalSubmit = false) => {
      try {
        if (!finalSubmit) {
          setShowReview(true);
          return;
        }

        if (!currentUser) {
          message.error("Please log in to submit the test");
          navigate("/login", { state: { from: location.pathname } });
          return;
        }

        setIsLoading(true);
        const questionIds = questions.map((q) => q._id);
        const result = await submitTestAnswers(answers, questionIds);
        setScore(result.score);
        setTestCompleted(true);
        setShowReview(false);
        if (timerRef.current) clearInterval(timerRef.current);
        message.success("Test submitted successfully!");
      } catch (error) {
        console.error("Error submitting test:", error);
        const errorMessage =
          typeof error === "string"
            ? error
            : error.message || "Failed to submit test";
        message.error(errorMessage);
        if (
          errorMessage.includes("expired") ||
          errorMessage.includes("missing") ||
          errorMessage.includes("authentication")
        ) {
          navigate("/login", {
            state: { from: location.pathname, message: errorMessage },
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [answers, questions, navigate, currentUser, location.pathname]
  );

  usePreventNavigation(
    testStarted &&
      !testCompleted &&
      !showReview &&
      questions.length > 0 &&
      !isLoading,
    handleSubmit
  );

  const handleBackToTest = () => setShowReview(false);

  // --- Timer Logic ---
  const handleTimeUp = useCallback(() => {
    if (questions.length === 0) return;
    if (currentQuestionIndex >= questions.length - 1) {
      handleSubmit(); // Auto submit on last question timeout? Or just finish?
      // Usually better to force submit or move to review. Let's move to review/submit.
      // If last question time up, we mark it unanswered and try to submit.
      const currentQ = questions[questions.length - 1];
      setAnswers((prev) => {
        if (currentQ && !prev[currentQ._id]) {
          return { ...prev, [currentQ._id]: "unanswered" };
        }
        return prev;
      });
      // Trigger submit
      handleSubmit(true);
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    setAnswers((prev) => {
      if (currentQuestion && !prev[currentQuestion._id]) {
        return { ...prev, [currentQuestion._id]: "unanswered" };
      }
      return prev;
    });

    setCurrentQuestionIndex((prev) => prev + 1);
    setTimeLeft(QUESTION_TIME_LIMIT);
  }, [currentQuestionIndex, questions, handleSubmit]);

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
    testStarted,
    testCompleted,
    questions.length,
    startTimer,
  ]);

  // --- Fetch Questions ---
  useEffect(() => {
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

  // --- Navigation Handlers ---
  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestionIndex < questions.length - 1) {
      if (answers[currentQuestion._id] !== undefined) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTimeLeft(QUESTION_TIME_LIMIT);
      } else {
        alert("Please select an answer before proceeding.");
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setTimeLeft(QUESTION_TIME_LIMIT);
    }
  };

  // --- RENDER ---

  // 0. Checking Status
  if (checkingTestStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-5">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="text-gray-600 font-medium text-lg">
            Checking your test status...
          </p>
        </div>
      </div>
    );
  }

  // 1. Already Taken
  if (hasTakenTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-5">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <CheckCircleFilled style={{ fontSize: "48px", color: "#4CAF50" }} />
            <h2 className="text-3xl font-bold text-gray-900 mt-4">
              Test Already Completed
            </h2>
            <p className="text-gray-500 mt-2">
              You have already taken the scholarship test.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading
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

  // 3. Results
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

  // 4. Instructions Screen (UPDATED CONTENT HERE)
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-5">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <SafetyCertificateFilled
                style={{ fontSize: "56px", color: "#4f46e5" }}
              />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6 mb-2">
                Scholarship Evaluation
              </h1>
              <div className="h-1 w-24 bg-indigo-500 mx-auto rounded-full"></div>
            </div>

            {/* Critical Alert */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-10 rounded-r-lg shadow-sm">
              <div className="flex items-start gap-4">
                <WarningOutlined className="text-red-500 text-2xl mt-1" />
                <div>
                  <h4 className="font-bold text-red-800 text-lg mb-1">
                    Strict Time Constraint
                  </h4>
                  <p className="text-red-700">
                    You have strictly{" "}
                    <strong>{QUESTION_TIME_LIMIT} seconds</strong> per question.
                    The test will <strong>auto-advance</strong> if time runs
                    out, and you cannot revisit skipped questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Policy Section */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <FileTextOutlined className="text-indigo-600 text-xl" />
                <h3 className="text-xl font-bold text-gray-900">
                  Scholarship Test Policy & Important Warnings – FirstVite
                </h3>
              </div>

              <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
                <p>
                  The FirstVite Scholarship Evaluation Test is designed to
                  ensure a fair, transparent, and merit-based assessment process
                  for all candidates. Before starting the online scholarship
                  test, applicants must carefully read and follow all rules and
                  policies mentioned below.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Time Management
                    </h4>
                    <p className="text-sm text-gray-600">
                      Each question has a strict time limit. Once time expires,
                      the system automatically moves to the next question.
                      Unanswered questions cannot be revisited. Manage your time
                      efficiently.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      System Integrity
                    </h4>
                    <p className="text-sm text-gray-600">
                      A stable internet connection is mandatory. Refreshing the
                      page, switching tabs, minimizing the window, or using the
                      back button may result in automatic disqualification.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Anti-Malpractice
                    </h4>
                    <p className="text-sm text-gray-600">
                      Our platform detects suspicious activities. Use of unfair
                      means, external assistance, screen recording, or multiple
                      devices will lead to immediate cancellation and
                      disqualification.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Final Submission
                    </h4>
                    <p className="text-sm text-gray-600">
                      All submitted responses are final and cannot be edited. By
                      proceeding, you agree to comply with all FirstVite
                      policies. Failure to follow guidelines may impact
                      eligibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agreement & Start */}
            <div className="border-t border-gray-100 pt-8">
              <label className="flex items-center gap-4 cursor-pointer mb-8 group p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-6 h-6 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-gray-700 font-medium group-hover:text-gray-900">
                  I have read and understood the rules, policies, and warnings
                  stated above.
                </span>
              </label>

              <button
                disabled={!agreed}
                onClick={() => setTestStarted(true)}
                className={`w-full py-4 rounded-full text-lg font-bold tracking-wide transition-all duration-300 shadow-xl
                  ${
                    agreed
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
              >
                Start Assessment Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Review Screen
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

  // 6. Active Test Interface
  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / questions.length) * 100
  );
  const isTimeCritical = timeLeft <= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Test Header */}
        <div className="p-6 md:p-8 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-700">
              Question {currentQuestionIndex + 1}
              <span className="text-gray-400 font-normal ml-1">
                / {questions.length}
              </span>
            </h3>

            <div
              className={`px-4 py-1.5 rounded-full flex items-center gap-2 border font-bold transition-all duration-300 ${
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
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Component */}
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
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
              currentQuestionIndex === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <LeftOutlined style={{ fontSize: "14px" }} /> Previous
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[questions[currentQuestionIndex]?._id]}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all shadow-md ${
                answers[questions[currentQuestionIndex]?._id]
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next Question <RightOutlined style={{ fontSize: "14px" }} />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={
                isLoading || !answers[questions[currentQuestionIndex]?._id]
              }
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all shadow-md ${
                answers[questions[currentQuestionIndex]?._id] && !isLoading
                  ? "bg-green-500 text-white hover:bg-green-600 hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CheckCircleFilled /> Review Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipTest;
