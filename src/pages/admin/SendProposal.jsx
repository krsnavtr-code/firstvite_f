import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "../../api/axios";

const SendProposal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Default form values
  const defaultValues = {
    subject: "Partnership Opportunity - FirstVITE x [College Name]",
    studentMessage: `Dear [Student's Name],

We are excited to inform you about an exclusive learning opportunity with FirstVITE E-Learning Platform. As part of our partnership with your institution, we are offering you access to our premium courses and certification programs.

Benefits for You:
- Access to industry-relevant courses
- Learn at your own pace
- Get certified in high-demand skills
- Career guidance and placement support

We encourage you to take advantage of this opportunity to enhance your skills and boost your career prospects.

Best regards,
[Your Name]
FirstVITE E-Learning Team`,
    collegeMessage: `Dear [College Name] Team,

I hope this message finds you well. I am reaching out on behalf of FirstVITE E-Learning to explore potential collaboration opportunities between our organizations.

FirstVITE is a leading e-learning platform dedicated to providing high-quality technical education and skill development programs. We are currently seeking partnerships with esteemed educational institutions like yours to help bridge the gap between academia and industry requirements.

Key Benefits of Partnership:
- Access to our comprehensive e-learning platform
- Industry-relevant curriculum designed by experts
- Certification programs aligned with current market demands
- Placement assistance for students
- Faculty development programs

We would be delighted to discuss how we can work together to enhance the learning experience for your students. Please let us know a convenient time for a meeting or call to explore this opportunity further.

Looking forward to your positive response.

Best regards,
[Your Name]
FirstVITE E-Learning Team`,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      messageType: "student", // Set default message type
      subject: defaultValues.subject,
      studentMessage: defaultValues.studentMessage,
      collegeMessage: defaultValues.collegeMessage,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      // Process emails from textarea (split by newline and filter out empty lines)
      const emailList = data.emails
        .split("\n")
        .map((email) => email.trim())
        .filter((email) => email);

      // Get the selected message type
      const selectedMessageType = watch("messageType");

      // Prepare the data object that will be stringified
      const emailData = {
        emails: emailList,
        subject: data.subject,
        message:
          selectedMessageType === "student"
            ? data.studentMessage
            : data.collegeMessage,
      };

      // Debug log to check the selected message type and content
      console.log("Selected message type:", selectedMessageType);
      console.log("Using message:", emailData.message.substring(0, 50) + "...");

      // Add the stringified data to formData
      formData.append("data", JSON.stringify(emailData));

      // Add files if any
      if (files && files.length > 0) {
        console.log("Adding files to form data:", files);
        for (let i = 0; i < files.length; i++) {
          formData.append("attachments", files[i]);
          console.log(`Added file ${i + 1}: ${files[i].name} (${(files[i].size / (1024 * 1024)).toFixed(2)}MB)`);
        }
      } else {
        console.log("No files to attach");
      }

      // Log form data for debugging (without logging file content)
      for (let pair of formData.entries()) {
        if (pair[0] === 'attachments') {
          console.log(`${pair[0]}: ${pair[1].name} (${(pair[1].size / (1024 * 1024)).toFixed(2)}MB)`);
        } else {
          console.log(pair[0] + ':', pair[1]);
        }
      }

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Show loading toast
      const toastId = toast.loading('Sending emails with attachments...');

      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:4002/api"
          }/v1/admin/emails/send-proposal`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            timeout: 120000, // Increased to 2 minutes
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              toast.loading(`Uploading files: ${percentCompleted}%`, { id: toastId });
            },
          }
        );

        // Update toast to success
        toast.success('Emails sent successfully!', { id: toastId });

        if (response.data && response.data.status === "success") {
          const messageType = watch("messageType");
          const recipientType =
            messageType === "student" ? "student" : "college/university";

          setSuccess(`Proposal sent successfully to ${recipientType}!`);
          toast.success(response.data.message || "Proposal sent successfully!");

          // Reset form but keep the default messages and current message type
          reset({
            subject: defaultValues.subject,
            messageType: messageType,
            studentMessage: defaultValues.studentMessage,
            collegeMessage: defaultValues.collegeMessage,
            emails: "",
          });
          setFiles([]);
        } else {
          throw new Error(response.data?.message || "Failed to send proposal");
        }
      } catch (error) {
        console.error("Error sending proposal:", error);

        // Check if it's a timeout error
        if (
          error.code === "ECONNABORTED" ||
          error.message.includes("timeout")
        ) {
          // Show success message even on timeout since emails are processed in background
          const messageType = watch("messageType");
          const recipientType =
            messageType === "student" ? "student" : "college/university";

          setSuccess(`Proposal is being sent to ${recipientType}!`);
          toast.success(
            "Your request is being processed. You'll receive a confirmation once completed."
          );

          // Still reset the form
          reset({
            subject: defaultValues.subject,
            messageType: messageType,
            studentMessage: defaultValues.studentMessage,
            collegeMessage: defaultValues.collegeMessage,
            emails: "",
          });
          setFiles([]);
        } else {
          // Handle other types of errors
          const errorMessage =
            error.response?.data?.message ||
            "Failed to send proposal. Please try again.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const validFiles = [];
      const invalidFiles = [];

      Array.from(e.target.files).forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          invalidFiles.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        } else {
          validFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        toast.error(`The following files exceed 10MB: ${invalidFiles.join(', ')}`);
      }

      if (validFiles.length > 0) {
        console.log("Valid files selected:", validFiles);
        setFiles(validFiles);
      } else {
        setFiles([]);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Send Proposal to Colleges</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="emails"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Addresses (one per line)
          </label>
          <textarea
            id="emails"
            {...register("emails", {
              required: "At least one email address is required",
            })}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            placeholder="college1@example.com
college2@example.com
college3@example.com"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter one email address per line
          </p>
          {errors.emails && (
            <p className="mt-1 text-sm text-red-600">{errors.emails.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            {...register("subject", { required: "Subject is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Proposal for Partnership"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Student Message Card */}
          <div
            className={`border-2 rounded-lg p-4 transition-colors ${
              watch("messageType") === "student"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-indigo-300"
            }`}
          >
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                {...register("messageType", {
                  required: "Please select a message type",
                })}
                value="student"
                className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                defaultChecked
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="block text-sm font-medium text-gray-700">
                    Message for Student
                  </span>
                </div>
                <div className="mt-2">
                  <textarea
                    {...register("studentMessage", {
                      required: "Student message is required",
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write your message for the student here..."
                  />
                  {errors.studentMessage && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.studentMessage.message}
                    </p>
                  )}
                </div>
              </div>
            </label>
          </div>

          {/* College Message Card */}
          <div
            className={`border-2 rounded-lg p-4 transition-colors ${
              watch("messageType") === "college"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-indigo-300"
            }`}
          >
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                {...register("messageType")}
                value="college"
                className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="block text-sm font-medium text-gray-700">
                    Message for College/University
                  </span>
                </div>
                <div className="mt-2">
                  <textarea
                    {...register("collegeMessage", {
                      required: "College/University message is required",
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write your message for the college/university here..."
                  />
                  {errors.collegeMessage && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.collegeMessage.message}
                    </p>
                  )}
                </div>
              </div>
            </label>
          </div>

          {errors.messageType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.messageType.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments (Optional)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            You can attach multiple files (e.g., PDFs, Word documents)
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Proposal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendProposal;
