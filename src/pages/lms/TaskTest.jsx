import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Progress, message, Modal, Spin } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { getTask, submitTaskAnswers } from "../../api/taskApi";

/** --------------------------
 *  QuestionCard Component
 -------------------------- */
const QuestionCard = ({
  question,
  index,
  answer,
  onAnswerSelect,
  showResults,
}) => {
  const isCorrect = question.options.every((opt) =>
    opt.isCorrect ? answer?.includes(opt.text) : !answer?.includes(opt.text),
  );

  return (
    <div
      key={index}
      className="mb-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-200 dark:bg-[#001525] text-black dark:text-white shadow-sm overflow-hidden"
    >
      {/* Card Header (Title Section) */}
      <div className="p-2 md:p-4 border-b border-gray-300 dark:border-gray-800">
        <span className="font-semibold text-base text-black dark:text-white">
          {`Question ${index + 1} (${question.points || 1} point${(question.points || 1) > 1 ? "s" : ""})`}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-2 md:p-6">
        {/* Question Text */}
        <p className="text-lg mb-4 text-black dark:text-white font-medium">
          {question.question}
        </p>

        {/* Options List */}
        <div className="space-y-2">
          {question.options.map((option, optIndex) => {
            const isSelected =
              question.questionType === "true_false"
                ? answer === option.text
                : answer?.includes(option.text);

            return (
              <div
                key={optIndex}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200"
                    : "border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800 bg-white dark:bg-[#001c32]"
                }`}
                onClick={() =>
                  onAnswerSelect(
                    index,
                    option.text,
                    question.questionType !== "true_false",
                  )
                }
              >
                <div className="flex items-center">
                  {/* Custom Radio/Checkbox Circle */}
                  <div
                    className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-400 dark:border-gray-500 bg-white dark:bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.text}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Results / Explanation Section */}
        {showResults && (
          <div className="mt-4 p-4 bg-gray-300 rounded-md dark:bg-[#001c32] border border-gray-400/20 dark:border-gray-700">
            <p className="font-semibold mb-2 text-sm">
              {isCorrect ? (
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  {/* SVGs used instead of AntD Icons */}
                  <svg
                    className="w-5 h-5 mr-2 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Correct Answer
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Incorrect Answer
                </span>
              )}
            </p>

            {question.explanation && (
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                <strong className="text-gray-900 dark:text-white">
                  Explanation:
                </strong>{" "}
                {question.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** --------------------------
 *  Main TaskTest Component
 -------------------------- */
const TaskTest = () => {
  const { courseId, sprintId, sessionId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /** Fetch Task */
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
              initAns[i] = q.questionType === "true_false" ? null : [];
            });
          }
          setAnswers(initAns);
          setStartTime(new Date());
        } else {
          console.error("No task data found in response:", res);
          message.error("No task data found");
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
  }, [taskId]);

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
      const correctAns = q.options
        .filter((o) => o.isCorrect)
        .map((o) => o.text);

      if (q.questionType === "true_false") {
        if (userAns === correctAns[0]) correct++;
      } else if (
        Array.isArray(userAns) &&
        userAns.length === correctAns.length &&
        userAns.every((a) => correctAns.includes(a))
      ) {
        correct++;
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

  /** Loader */
  if (loading || !task) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  /** Results Screen */
  if (showResults) {
    const pass = score >= 80;
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-10">
          <Progress
            type="circle"
            percent={score}
            width={120}
            strokeColor={pass ? "#52c41a" : "#ff4d4f"}
          />
          <h1 className="text-2xl text-black font-bold mt-4">
            {pass ? "🎉 Congratulations!" : "💪 Keep Practicing!"}
          </h1>
          <p className="text-gray-600 mb-8">
            {pass
              ? `You passed with ${score}%`
              : `You scored ${score}%. Minimum 80% required.`}
          </p>

          <div className="flex justify-center gap-4">
            {/* <Button onClick={() => window.location.reload()} className="text-blue-600 font-bold border-2 border-blue-600">
              Try Again
            </Button> */}
            <Button
              onClick={() =>
                navigate(
                  `/smart-board/courses/${courseId}/sprints/${sprintId}/sessions/${sessionId}`,
                )
              }
              className="text-blue-600 font-bold border-2 border-blue-600"
            >
              Back to Session
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-black mt-10 mb-4">
          Review Your Answers
        </h2>
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
    );
  }

  if (loading || !task?.questions) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  /** Active Test Screen */
  const currentQ = task.questions[currentIndex];
  const progress = ((currentIndex + 1) / task.questions.length) * 100;

  return (
    <div className="max-w-7xl mx-auto text-black dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() =>
            navigate(`/smart-board/courses/${courseId}/sprints/${sprintId}`)
          }
        >
          <ArrowLeftOutlined />
          Back
        </button>
        <span className="text-green-600">
          ⏱ {Math.floor(timeSpent / 60)}:
          {(timeSpent % 60).toString().padStart(2, "0")}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span>
            Question {currentIndex + 1} of {task.questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress percent={progress} showInfo={false} />
      </div>

      <p className="text-2xl font-bold mb-2">{task.title}</p>

      <QuestionCard
        question={currentQ}
        index={currentIndex}
        answer={answers[currentIndex]}
        onAnswerSelect={handleAnswerSelect}
        showResults={false}
      />

      <div className="flex justify-between mt-8">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="font-bold bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded"
        >
          Previous
        </button>
        {currentIndex === task.questions.length - 1 ? (
          <button
            loading={submitting}
            onClick={() =>
              Modal.confirm({
                title: "Submit Test?",
                content: "Once submitted, you cannot change answers.",
                onOk: handleSubmit,
                okButtonProps: {
                  className: "text-white bg-green-600 hover:bg-green-700",
                },
                okText: "Submit",
                cancelText: "Cancel",
                okType: "success",
              })
            }
            className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="font-bold bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskTest;
