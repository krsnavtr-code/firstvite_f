import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "../../api/axios";

const SendProposal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [collegeName, setCollegeName] = useState("");

  // Default form values
  const defaultValues = {
    subject:
      "Invitation to Partner for Our Career Hiring Camp – Empower Students with Real Job Opportunities",
    studentMessage: `
Dear Student,

Greetings from FirstVITE E-Learning Pvt. Ltd.!

We are excited to invite you to participate in our upcoming Career Hiring Camp 2025, a unique platform where you can connect directly with leading companies that are hiring fresh graduates and final-year students.

This event is designed to help you kickstart your career journey with opportunities for:

On-the-spot interviews and job offers

Internship and placement opportunities

Skill-building sessions by industry experts

Networking with recruiters from reputed organizations

🎯 Why You Should Join:

100% Free Registration

Certificate of Participation

Real Hiring Exposure

📝 Register Now:
Click the link below to secure your spot:
👉 https://firstvite.com/jobfair

📅 Event Details will be send to your email after registration.

Organized by: FirstVITE E-Learning Pvt. Ltd.

Don’t miss this golden opportunity to get noticed by hiring companies and start your professional journey.

We look forward to seeing you at the event!

Warm regards,
FirstVITE E-Learning Pvt. Ltd.
📞 9990056799
📧 info@firstvite.com
🌐 https://firstvite.com
`,
    collegeMessage: `
Dear ${collegeName},

Greetings from FirstVITE E-Learning Pvt. Ltd.!

We are delighted to inform you that we are organizing a Career Hiring Camp in collaboration with several leading partner companies who are actively recruiting fresh graduates and final-year students.

The objective of this initiative is to bridge the gap between education and employment by connecting talented students directly with hiring partners and offering them career guidance, interview exposure, and skill-building sessions — all under one platform.

Your esteemed institution’s participation in this camp would provide your students with:

Direct interaction with multiple hiring companies

Access to real job and internship opportunities

Free participation (no registration or hidden fees)

Certificates and recognition for participants

To confirm your institution’s participation, please fill out the short form below:
👉 https://firstvite.com/jobfair

Our team will get in touch with you for further coordination and provide detailed schedules.

We look forward to having your institution join us in empowering the next generation of professionals.

Warm regards,
FirstVITE E-Learning Pvt. Ltd.
📞 9990056799
📧 info@firstvite.com
🌐 https://firstvite.com
`,
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

      // Add files first (this is important for some servers)
      if (files && files.length > 0) {
        console.log("Adding files to form data:", files);
        files.forEach((file, index) => {
          formData.append("attachments", file);
          console.log(
            `Added file ${index + 1}: ${file.name} (${(
              file.size /
              (1024 * 1024)
            ).toFixed(2)}MB)`
          );
        });
      } else {
        console.log("No files to attach");
      }

      // Add the stringified data to formData as the last item
      formData.append("data", JSON.stringify(emailData));

      // Log form data for debugging (without logging file content)
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        if (pair[0] === "attachments") {
          console.log(
            `${pair[0]}: ${pair[1].name} (${(
              pair[1].size /
              (1024 * 1024)
            ).toFixed(2)}MB)`
          );
        } else {
          console.log(pair[0] + ":", pair[1]);
        }
      }

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Show loading toast
      const toastId = toast.loading("Sending emails with attachments...");

      try {
        const response = await axios({
          method: "post",
          url: `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:4002/api"
          }/v1/admin/emails/send-proposal`,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 120000, // 2 minutes
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            toast.loading(`Uploading files: ${percentCompleted}%`, {
              id: toastId,
            });
          },
        });

        // Update toast to success
        toast.success("Emails sent successfully!", { id: toastId });

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
      const ALLOWED_TYPES = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];

      const validFiles = [];
      const invalidFiles = [];
      const invalidTypeFiles = [];

      Array.from(e.target.files).forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          invalidFiles.push(
            `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
          );
        } else if (!ALLOWED_TYPES.includes(file.type)) {
          invalidTypeFiles.push(
            `${file.name} (${file.type || "unknown type"})`
          );
        } else {
          validFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        toast.error(
          `The following files exceed 10MB: ${invalidFiles.join(", ")}`
        );
      }

      if (invalidTypeFiles.length > 0) {
        toast.error(`Unsupported file types: ${invalidTypeFiles.join(", ")}`);
      }

      if (validFiles.length > 0) {
        console.log("Valid files selected:", validFiles);
        setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      }
    }
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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
            htmlFor="collegeName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            College/Institution Name
          </label>
          <input
            type="text"
            id="collegeName"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            placeholder="Enter college or institution name"
          />
          <p className="mt-1 text-xs text-gray-500 mb-4">
            This will be used to personalize the college message
          </p>
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
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF up to 10MB
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Selected files:
              </h4>
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                  >
                    <div className="w-0 flex-1 flex items-center">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 flex-1 w-0 truncate">
                        {file.name}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="font-medium text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
