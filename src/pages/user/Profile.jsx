import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import userApi from "../../api/userApi";
import { useNavigate } from "react-router-dom";
import { useLMS } from "../../contexts/LMSContext";
import { getUserTestResults } from "../../api/testService";

// Keep existing icons or replace with a library like lucide-react if preferred
import {
  BookOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  EditOutlined,
  CloseOutlined,
  SaveOutlined,
  CheckOutlined,
  CloseOutlined as CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const Profile = () => {
  const { currentUser: authUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [loadingTestResult, setLoadingTestResult] = useState(true);
  const [showTestReview, setShowTestReview] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (authUser) {
      setFormData({
        fullname: authUser.fullname || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        address: authUser.address || "",
      });
    }

    const fetchTestResults = async () => {
      if (!authUser) {
        setLoadingTestResult(false);
        return;
      }
      try {
        setLoadingTestResult(true);
        const result = await getUserTestResults();
        setTestResult(result);
      } catch (error) {
        console.error("Error fetching test results:", error);
        if (error.response?.status !== 404) {
          toast.error(error.message || "Failed to load test results");
        }
      } finally {
        setLoadingTestResult(false);
      }
    };

    fetchTestResults();
  }, [authUser]);

  const { enrollments, loading, loadEnrollments, error } = useLMS();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        await loadEnrollments();
      } catch (err) {
        toast.error(error || "Failed to load your courses");
      }
    };
    fetchEnrollments();
  }, [loadEnrollments, error]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!authUser) throw new Error("User not authenticated");
      const { phone, address } = formData;
      if (!phone && !address) {
        throw new Error("Please provide at least one field to update");
      }

      const response = await userApi.updateProfile({ phone, address });

      if (response && response.success) {
        updateUser({
          ...authUser,
          ...(phone && { phone }),
          ...(address && { address }),
        });
        setFormData((prev) => ({
          ...prev,
          phone: phone || prev.phone,
          address: address || prev.address,
        }));
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        throw new Error(response?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("Users");
        navigate("/login", { state: { from: "/profile" } });
      }
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/lms/courses/${courseId}`);
  };

  if (!authUser) {
    navigate("/login", { state: { from: "/profile" } });
    return null;
  }

  // --- Sub-Components for Clean Code ---

  const ProfileInput = ({ icon, label, name, type = "text", disabled }) => (
    <div className="relative group">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          disabled={disabled || !isEditing}
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 
            ${
              !isEditing
                ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            }`}
        />
      </div>
    </div>
  );

  const StatCard = ({ title, value, subValue, icon, colorClass, bgClass }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4">
      <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className={`text-xl font-bold ${colorClass} mt-0.5`}>{value}</h4>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Account Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your personal information and learning progress
            </p>
          </div>
        </div>

        {/* 1. Scholarship Result Section */}
        {loadingTestResult ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        ) : testResult ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <TrophyOutlined className="text-amber-500 text-lg" />
              <h2 className="text-lg font-semibold text-gray-800">
                Scholarship Assessment
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                  title="Total Score"
                  value={`${testResult.score} / ${testResult.totalQuestions}`}
                  subValue={`${testResult.percentage}% Accuracy`}
                  icon={<TrophyOutlined className="text-xl" />}
                  colorClass="text-indigo-600"
                  bgClass="bg-indigo-50"
                />
                <StatCard
                  title="Status"
                  value={testResult.percentage >= 50 ? "Passed" : "Not Passed"}
                  icon={
                    testResult.percentage >= 50 ? (
                      <CheckCircleOutlined className="text-xl" />
                    ) : (
                      <CloseOutlined className="text-xl" />
                    )
                  }
                  colorClass={
                    testResult.percentage >= 50
                      ? "text-green-600"
                      : "text-red-600"
                  }
                  bgClass={
                    testResult.percentage >= 50 ? "bg-green-50" : "bg-red-50"
                  }
                />
                <StatCard
                  title="Date Taken"
                  value={new Date(testResult.submittedAt).toLocaleDateString()}
                  icon={<ClockCircleOutlined className="text-xl" />}
                  colorClass="text-blue-600"
                  bgClass="bg-blue-50"
                />
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Performance Progress
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {testResult.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                      testResult.percentage >= 50
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${testResult.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  You answered{" "}
                  <span className="font-medium text-gray-900">
                    {testResult.score}
                  </span>{" "}
                  out of {testResult.totalQuestions} questions correctly.
                </p>
                <button
                  onClick={() => setShowTestReview(!showTestReview)}
                  className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  {showTestReview ? "Hide" : "View"} detailed results
                  <ArrowRightOutlined
                    className={`text-xs transition-transform ${
                      showTestReview ? "rotate-90" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Test Review Section */}
            {showTestReview && testResult.answers && (
              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Test Review
                </h3>
                <div className="space-y-6">
                  {testResult.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        answer.isCorrect
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full flex items-center justify-center ${
                            answer.isCorrect
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {answer.isCorrect ? (
                            <CheckOutlined className="text-xs" />
                          ) : (
                            <CloseCircleOutlined className="text-xs" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            Question {index + 1}: {answer.question}
                          </h4>

                          {/* Display options for multiple choice questions */}
                          {answer.questionType === "multiple_choice_single" &&
                            answer.options?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                <p className="text-sm text-gray-700">
                                  Options:
                                </p>
                                <div className="grid gap-2">
                                  {answer.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`px-3 py-2 rounded border text-sm ${
                                        option.isCorrect
                                          ? "bg-green-50 border-green-200 font-medium text-green-800"
                                          : "bg-white border-gray-200 text-gray-700"
                                      }`}
                                    >
                                      {option.text}
                                      {option.isCorrect && (
                                        <span className="ml-2 text-green-600">
                                          (Correct)
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          <div className="mt-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-sm text-gray-700">
                                Your answer:
                              </span>
                              <span className="text-sm">
                                {Array.isArray(answer.userAnswer)
                                  ? answer.userAnswer.join(", ")
                                  : String(answer.userAnswer || "Not answered")}
                              </span>
                            </div>

                            {!answer.isCorrect && (
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-sm text-gray-700">
                                  Correct answer:
                                </span>
                                <span className="text-sm">
                                  {Array.isArray(answer.correctAnswer)
                                    ? answer.correctAnswer.join(", ")
                                    : String(answer.correctAnswer || "N/A")}
                                </span>
                              </div>
                            )}

                            {answer.explanation && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                                <div className="flex items-start gap-2">
                                  <InfoCircleOutlined className="mt-0.5 flex-shrink-0" />
                                  <span>{answer.explanation}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State for Test */
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-md p-8 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <TrophyOutlined className="text-5xl mb-4 text-indigo-200" />
              <h2 className="text-2xl font-bold mb-2">
                Unlock Your Scholarship
              </h2>
              <p className="text-indigo-100 mb-6 max-w-lg mx-auto">
                Take our assessment test to qualify for exclusive scholarships
                and discounts on our courses.
              </p>
              <button
                onClick={() => navigate("/scholarship-test")}
                className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Take Assessment
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-10 translate-y-10"></div>
          </div>
        )}

        {/* 2. Layout Grid: Profile & Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Personal Details
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5
                    ${
                      isEditing
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    }`}
                >
                  {isEditing ? (
                    <>
                      <CloseOutlined /> Cancel
                    </>
                  ) : (
                    <>
                      <EditOutlined /> Edit
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <ProfileInput
                  label="Full Name"
                  name="fullname"
                  icon={<UserOutlined />}
                  disabled={true} // Usually names aren't editable directly
                />
                <ProfileInput
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={<MailOutlined />}
                  disabled={true} // Emails usually require verification to change
                />
                <ProfileInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  icon={<PhoneOutlined />}
                  disabled={false}
                />
                <ProfileInput
                  label="Address"
                  name="address"
                  icon={<HomeOutlined />}
                  disabled={false}
                />

                {isEditing && (
                  <div className="pt-4 animate-fade-in">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center items-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {isLoading ? (
                        "Saving..."
                      ) : (
                        <>
                          <SaveOutlined /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: My Learning */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOutlined className="text-xl text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">My Learning</h2>
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrollments.map((enrollment) => {
                  const course = enrollment.course;
                  const isCompleted =
                    enrollment.completionStatus === "completed";

                  return (
                    <div
                      key={enrollment._id}
                      onClick={() => handleCourseClick(course._id)}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/300x200?text=Course";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <BookOutlined className="text-4xl mb-2 opacity-50" />
                            <span className="text-sm">No Preview</span>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          {isCompleted && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                              <CheckCircleOutlined /> Completed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {course?.title || "Untitled Course"}
                        </h3>

                        <div className="mt-auto pt-4">
                          <button
                            className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors
                              ${
                                isCompleted
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  : "bg-gray-900 text-white hover:bg-indigo-600"
                              }`}
                          >
                            {isCompleted
                              ? "Review Course"
                              : "Continue Learning"}
                            {!isCompleted && <ArrowRightOutlined />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State for Courses */
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <BookOutlined className="text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No courses yet
                </h3>
                <p className="text-gray-500 mt-1 mb-6">
                  Start your learning journey by enrolling in a course.
                </p>
                <button
                  onClick={() => navigate("/lms/courses")}
                  className="text-indigo-600 font-semibold hover:text-indigo-700"
                >
                  Browse Courses &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
