import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Progress, message, Modal, Spin } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { getTask, submitTaskAnswers } from "../../api/taskApi";
import { getSprintById } from "../../api/sprintApi";

/** --------------------------
 *  QuestionCard Component
 * -------------------------- */
const QuestionCard = ({
  question,
  index,
  answer,
  onAnswerSelect,
  showResults,
}) => {
  const isCorrect = (() => {
    if (question.questionType === "true_false") {
      const correctOpt = question.options?.find((o) => o.isCorrect)?.text;
      return answer === correctOpt;
    }
    if (
      question.questionType === "short_answer" ||
      question.questionType === "fill_in_blank"
    ) {
      return (
        answer?.trim().toLowerCase() ===
        question.correctAnswer?.trim().toLowerCase()
      );
    }
    if (question.questionType === "essay") {
      if (question.correctAnswer) {
        return (
          answer?.trim().toLowerCase() ===
          question.correctAnswer?.trim().toLowerCase()
        );
      }
      return answer?.trim().length > 0;
    }
    // Default (MCQ)
    return (
      Array.isArray(answer) &&
      question.options?.every((opt) =>
        opt.isCorrect
          ? answer?.includes(opt.text)
          : !answer?.includes(opt.text),
      )
    );
  })();

  return (
    <div
      key={index}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
    >
      {/* Card Header (Title Section) */}
      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-150 dark:border-slate-800/80 flex flex-wrap justify-between items-center gap-2">
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
          Question {index + 1}
        </span>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {question.points || 1} point{(question.points || 1) > 1 ? "s" : ""}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5 md:p-6 space-y-5">
        {/* Question Text */}
        <p className="text-base md:text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
          {question.question}
        </p>

        {/* Options List / Text Fields */}
        <div className="space-y-3">
          {question.questionType === "short_answer" ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Your Short Answer:
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none"
                placeholder="Type your answer here..."
                value={answer || ""}
                disabled={showResults}
                onChange={(e) => onAnswerSelect(index, e.target.value, false)}
              />
            </div>
          ) : question.questionType === "essay" ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Your Detailed Response:
              </label>
              <textarea
                rows={5}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none resize-y"
                placeholder="Type your response here..."
                value={answer || ""}
                disabled={showResults}
                onChange={(e) => onAnswerSelect(index, e.target.value, false)}
              />
            </div>
          ) : question.questionType === "fill_in_blank" ? (
            <div className="space-y-3 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Type Correct Word for the Blank:
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none"
                placeholder="Type correct word here..."
                value={answer || ""}
                disabled={showResults}
                onChange={(e) => onAnswerSelect(index, e.target.value, false)}
              />
            </div>
          ) : (
            question.options?.map((option, optIndex) => {
              const isSelected =
                question.questionType === "true_false"
                  ? answer === option.text
                  : answer?.includes(option.text);

              return (
                <div
                  key={optIndex}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 font-semibold shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  }`}
                  onClick={() =>
                    !showResults &&
                    onAnswerSelect(
                      index,
                      option.text,
                      question.questionType !== "true_false",
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold leading-none shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-500"
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className="text-sm md:text-base font-medium leading-normal pr-1">
                      {option.text}
                    </span>
                  </div>

                  {/* Animated indicator on the far right */}
                  <div
                    className={`w-5 h-5 rounded-full border mr-1 flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isSelected
                        ? "bg-blue-500 border-blue-500 scale-110"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Results / Explanation Section */}
        {showResults && (
          <div
            className={`mt-5 p-5 rounded-2xl border flex flex-col gap-3 ${
              isCorrect
                ? "bg-emerald-50/60 dark:bg-emerald-950/15 text-emerald-800 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30"
                : "bg-rose-50/60 dark:bg-rose-950/15 text-rose-800 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30"
            }`}
          >
            <div className="font-bold flex items-center gap-2 text-sm">
              {isCorrect ? (
                <>
                  <CheckCircleOutlined className="text-emerald-500 text-base" />
                  <span>Correct Answer</span>
                </>
              ) : (
                <>
                  <CloseCircleOutlined className="text-rose-500 text-base" />
                  <span>Incorrect Answer</span>
                </>
              )}
            </div>

            {!isCorrect && (
              <div className="text-sm font-semibold text-slate-750 dark:text-slate-200 mt-1">
                {question.questionType === "short_answer" ||
                question.questionType === "fill_in_blank" ||
                (question.questionType === "essay" &&
                  question.correctAnswer) ? (
                  <span>
                    Expected Answer:{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50">
                      {question.correctAnswer}
                    </span>
                  </span>
                ) : (
                  <span>
                    Expected Answer(s):{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50">
                      {question.options
                        ?.filter((o) => o.isCorrect)
                        .map((o) => o.text)
                        .join(", ")}
                    </span>
                  </span>
                )}
              </div>
            )}

            {question.explanation && (
              <div className="text-sm leading-relaxed border-t border-slate-200/20 dark:border-slate-700/20 pt-2.5">
                <strong className="font-bold text-slate-800 dark:text-white block mb-1">
                  Explanation:
                </strong>{" "}
                {question.explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** --------------------------
 *  Main TaskTest Component
 * -------------------------- */
const TaskTest = () => {
  const { courseId, sprintId, sessionId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [sprint, setSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /** Fetch Task and Sprint details */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTask(taskId);

        if (res && res.data && res.data.task) {
          const taskData = res.data.task;
          setTask(taskData);

          // init answers
          const initAns = {};
          if (taskData.questions && Array.isArray(taskData.questions)) {
            taskData.questions.forEach((q, i) => {
              if (q.questionType === "true_false") {
                initAns[i] = null;
              } else if (
                q.questionType === "short_answer" ||
                q.questionType === "essay" ||
                q.questionType === "fill_in_blank"
              ) {
                initAns[i] = "";
              } else {
                initAns[i] = [];
              }
            });
          }
          setAnswers(initAns);
          setStartTime(new Date());
        } else {
          console.error("No task data found in response:", res);
          message.error("No task data found");
        }

        // Fetch sprint to check start date
        try {
          const sprintResponse = await getSprintById(sprintId);
          const sprintData =
            sprintResponse?.data?.sprint ||
            sprintResponse?.data ||
            sprintResponse;
          if (sprintData) {
            setSprint(sprintData);
          }
        } catch (sprintError) {
          console.error(
            "Error fetching sprint details in TaskTest:",
            sprintError,
          );
        }
      } catch (error) {
        console.error("Error fetching task:", error);
        message.error(
          "Failed to load task: " + (error.message || "Unknown error"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(() => setTimeSpent((t) => t + 1), 1000);
    return () => {
      clearInterval(timer);
    };
  }, [taskId, sprintId]);

  /** Answer Handler */
  const handleAnswerSelect = useCallback((qIndex, ans, isMulti) => {
    setAnswers((prev) => {
      if (isMulti) {
        const current = prev[qIndex] || [];
        return {
          ...prev,
          [qIndex]: current.includes(ans)
            ? current.filter((a) => a !== ans)
            : [...current, ans],
        };
      }
      return { ...prev, [qIndex]: ans };
    });
  }, []);

  /** Score Calculation */
  const calculateScore = useCallback(() => {
    let correct = 0;
    task?.questions.forEach((q, i) => {
      const userAns = answers[i];

      if (q.questionType === "true_false") {
        const correctOpt = q.options?.find((o) => o.isCorrect)?.text;
        if (userAns === correctOpt) correct++;
      } else if (
        q.questionType === "short_answer" ||
        q.questionType === "fill_in_blank"
      ) {
        if (
          userAns?.trim().toLowerCase() ===
          q.correctAnswer?.trim().toLowerCase()
        ) {
          correct++;
        }
      } else if (q.questionType === "essay") {
        if (q.correctAnswer) {
          if (
            userAns?.trim().toLowerCase() ===
            q.correctAnswer?.trim().toLowerCase()
          ) {
            correct++;
          }
        } else if (userAns?.trim().length > 0) {
          correct++;
        }
      } else {
        // MCQ
        const correctAns =
          q.options?.filter((o) => o.isCorrect).map((o) => o.text) || [];
        if (
          Array.isArray(userAns) &&
          userAns.length === correctAns.length &&
          userAns.every((a) => correctAns.includes(a))
        ) {
          correct++;
        }
      }
    });
    return Math.round((correct / task.questions.length) * 100);
  }, [task, answers]);

  /** Submit Handler */
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const finalScore = calculateScore();
      setScore(finalScore);

      const timeTaken = Math.round((new Date() - startTime) / 1000);
      await submitTaskAnswers({
        taskId,
        sessionId,
        answers,
        score: finalScore,
        timeSpent: timeTaken,
      });

      setShowResults(true);
    } catch {
      message.error("Submission failed!");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if sprint has started based on its start date
  const isSprintStarted = () => {
    if (!sprint) return false; // Default to locked until loaded
    if (!sprint.startDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(sprint.startDate);
    startDate.setHours(0, 0, 0, 0);
    return today >= startDate;
  };

  /** Loader */
  if (loading || !task) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Spin size="large" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  /** Sprint Not Started Lock Screen */
  if (!loading && sprint && !isSprintStarted()) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
            <LockOutlined />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
              Assessment Locked
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              This assessment belongs to a scheduled sprint that hasn't started
              yet.
              {sprint.startDate && (
                <span className="block mt-2 font-black text-amber-600 dark:text-amber-400">
                  Starts on:{" "}
                  {new Date(sprint.startDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() =>
              navigate(`/smart-board/courses/${courseId}/sprints/${sprintId}`)
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl shadow-sm transition-all duration-300"
          >
            <ArrowLeftOutlined className="text-xs" />
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  /** Results Screen */
  if (showResults) {
    const pass = score >= 80;
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm text-center flex flex-col items-center justify-center space-y-6">
          <Progress
            type="circle"
            percent={score}
            width={130}
            strokeWidth={10}
            strokeColor={pass ? "#10b981" : "#f43f5e"}
            format={(percent) => `${percent}%`}
            className="[&_.ant-progress-text]:text-slate-800 dark:[&_.ant-progress-text]:text-white [&_.ant-progress-text]:font-black [&_.ant-progress-text]:text-xl"
          />
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-tight">
              {pass ? "🎉 Congratulations! You Passed!" : "💪 Keep Practicing!"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
              {pass
                ? `Incredible job! You achieved a score of ${score}% and unlocked subsequent curriculum session modules.`
                : `You scored ${score}%. A minimum score of 80% is required to pass and unlock subsequent tasks.`}
            </p>
          </div>

          <button
            onClick={() =>
              navigate(`/smart-board/courses/${courseId}/sprints/${sprintId}`)
            }
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-[0.98] transition-all"
          >
            <ArrowLeftOutlined className="text-xs" />
            Back to Sprint Sessions
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CheckCircleOutlined className="text-blue-500 text-lg" />
            Review Your Answers
          </h2>
          <div className="space-y-5">
            {task.questions.map((q, i) => (
              <QuestionCard
                key={i}
                question={q}
                index={i}
                answer={answers[i]}
                onAnswerSelect={handleAnswerSelect}
                showResults
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading || !task?.questions) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  /** Active Test Screen */
  const currentQ = task.questions[currentIndex];
  const progress = ((currentIndex + 1) / task.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-6 text-black dark:text-white">
      {/* Header & Clock Section */}
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={() =>
            navigate(`/smart-board/courses/${courseId}/sprints/${sprintId}`)
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl shadow-sm transition-all duration-300"
        >
          <ArrowLeftOutlined className="text-xs" />
          Back to Sessions
        </button>

        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl font-black text-sm shadow-sm animate-pulse">
          ⏱ {Math.floor(timeSpent / 60)}:
          {(timeSpent % 60).toString().padStart(2, "0")}
        </span>
      </div>

      {/* Progress Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm space-y-2.5">
        <div className="flex justify-between text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>
            Question {currentIndex + 1} of {task.questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress
          percent={progress}
          showInfo={false}
          strokeWidth={10}
          strokeColor="#3b82f6"
          className="m-0"
        />
      </div>

      {/* Task Description Title */}
      <div className="space-y-1.5">
        <p className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
          Active Assessment
        </p>
        <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight">
          {task.title}
        </h2>
      </div>

      {/* Active QuestionCard */}
      <QuestionCard
        question={currentQ}
        index={currentIndex}
        answer={answers[currentIndex]}
        onAnswerSelect={handleAnswerSelect}
        showResults={false}
      />

      {/* Pagination & Submission Controls */}
      <div className="flex justify-between items-center pt-2">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 border flex items-center gap-1.5 ${
            currentIndex === 0
              ? "bg-slate-100/50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed shadow-none"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-500 active:scale-[0.97]"
          }`}
        >
          ← Previous
        </button>

        {currentIndex === task.questions.length - 1 ? (
          <button
            loading={submitting}
            onClick={() =>
              Modal.confirm({
                title: "Submit Test?",
                content:
                  "Are you sure you want to finish the assessment? Once submitted, you cannot modify your answers.",
                onOk: handleSubmit,
                okButtonProps: {
                  className:
                    "text-white bg-green-600 hover:bg-green-700 rounded-lg font-bold border-0 h-10 px-5",
                },
                cancelButtonProps: {
                  className:
                    "rounded-lg font-bold h-10 px-5 border border-slate-200 hover:border-slate-300",
                },
                okText: "Submit Test",
                cancelText: "Cancel",
                okType: "success",
                centered: true,
                className:
                  "[&_.ant-modal-content]:rounded-2xl dark:[&_.ant-modal-content]:bg-slate-900 dark:[&_.ant-modal-header]:bg-slate-900 dark:[&_.ant-modal-title]:text-white dark:[&_.ant-modal-body]:text-slate-300",
              })
            }
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/10 hover:shadow-green-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-500 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 shadow-sm"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskTest;
