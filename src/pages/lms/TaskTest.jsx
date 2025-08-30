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
    opt.isCorrect ? answer?.includes(opt.text) : !answer?.includes(opt.text)
  );

  return (
    <Card
      key={index}
      title={
        <span className="text-black dark:text-white">{`Question ${index + 1} (${
          question.points || 1
        } point${(question.points || 1) > 1 ? "s" : ""})`}</span>
      }
      className="mb-6 bg-gray-200 dark:bg-[#001525] text-black dark:text-white"
    >
      <p className="text-lg mb-4 dark:text-white">{question.question}</p>

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
                  ? "border-blue-500 bg-blue-50 text-black"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() =>
                onAnswerSelect(
                  index,
                  option.text,
                  question.questionType !== "true_false"
                )
              }
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-400"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full"></div>
                  )}
                </div>
                <span>{option.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showResults && (
        <div className="mt-4 p-3 bg-gray-200 rounded-md dark:bg-[#001525]">
          <p className="font-medium mb-2">
            {isCorrect ? (
              <span className="text-green-600 flex items-center">
                <CheckCircleOutlined className="mr-2" /> Correct Answer
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <CloseCircleOutlined className="mr-2" /> Incorrect Answer
              </span>
            )}
          </p>
          {question.explanation && (
            <p className="text-gray-600 text-sm">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}
    </Card>
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
      console.log("Fetching task data...");
      try {
        const res = await getTask(taskId);
        console.log("Task API response:", res);

        if (res && res.data && res.data.task) {
          console.log("Task data received:", res.data.task);
          const taskData = res.data.task;
          setTask(taskData);

          // init answers
          const initAns = {};
          if (taskData.questions && Array.isArray(taskData.questions)) {
            taskData.questions.forEach((q, i) => {
              initAns[i] = q.questionType === "true_false" ? null : [];
            });
          }
          console.log("Initialized answers:", initAns);
          setAnswers(initAns);
          setStartTime(new Date());
        } else {
          console.error("No task data found in response:", res);
          message.error("No task data found");
        }
      } catch (error) {
        console.error("Error fetching task:", error);
        message.error(
          "Failed to load task: " + (error.message || "Unknown error")
        );
      } finally {
        console.log("Finished loading task");
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(() => setTimeSpent((t) => t + 1), 1000);
    return () => {
      console.log("Cleaning up task timer");
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
                  `/lms/courses/${courseId}/sprints/${sprintId}/sessions/${sessionId}`
                )
              }
              className="text-blue-600 font-bold border-2 border-blue-600"
            >
              Back to Session
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-black mt-10 mb-4">Review Your Answers</h2>
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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            navigate(
              `/lms/courses/${courseId}/sprints/${sprintId}/sessions/${sessionId}`
            )
          }
        >
          Back
        </Button>
        <span className="text-red-600">
          ⏱ {Math.floor(timeSpent / 60)}:
          {(timeSpent % 60).toString().padStart(2, "0")}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm font-medium text-black">
          <span>
            Question {currentIndex + 1} of {task.questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress percent={progress} showInfo={false} />
      </div>

      <h1 className="text-2xl font-bold mb-6 text-black">{task.title}</h1>

      <QuestionCard
        question={currentQ}
        index={currentIndex}
        answer={answers[currentIndex]}
        onAnswerSelect={handleAnswerSelect}
        showResults={false}
      />

      <div className="flex justify-between mt-8">
        <Button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="text-red-600 font-bold border-2 border-red-600"
        >
          Previous
        </Button>
        {currentIndex === task.questions.length - 1 ? (
          <Button
            loading={submitting}
            onClick={() =>
              Modal.confirm({
                title: 'Submit Test?',
                content: 'Once submitted, you cannot change answers.',
                onOk: handleSubmit,
                okButtonProps: {
                  className: 'text-white bg-green-600 hover:bg-green-700'
                },
                okText: 'Submit',
                cancelText: 'Cancel',
                okType: 'success'
              })
            }
            className="text-green-600 font-bold border-2 border-green-600"
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="text-blue-600 font-bold border-2 border-blue-600"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskTest;
