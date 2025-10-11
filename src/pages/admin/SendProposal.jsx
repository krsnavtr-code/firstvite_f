import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "../../api/axios";

const SendProposal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Split emails by newline and filter out any empty strings
      const emailList = data.emails
        .split("\n")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Create form data for the request
      const formDataToSend = new FormData();
      
      // Add the email list as a JSON string
      formDataToSend.append('data', JSON.stringify({
        emails: emailList,
        subject: data.subject,
        message: data.message
      }));
      
      // Append files if any
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formDataToSend.append('attachments', file);
        });
      }
      
      // Log the data being sent for debugging
      console.log('Sending form data:', {
        emails: emailList,
        subject: data.subject,
        message: data.message,
        fileCount: files?.length || 0
      });

      const response = await axios.post(
        "/v1/admin/emails/send-proposal",
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      // Log the response for debugging
      console.log('Server response:', response.data);

      // Check if the response indicates success
      if (response.data && response.data.status === 'success') {
        toast.success(response.data.message || "Proposal emails sent successfully!");
        reset();
        setFiles([]);
      } else {
        throw new Error(response.data?.message || 'Failed to send emails');
      }
    } catch (error) {
      console.error("Error sending proposal:", error);
      toast.error(
        error.response?.data?.message || "Failed to send proposal emails"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
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

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            {...register("message", { required: "Message is required" })}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Write your proposal message here..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">
              {errors.message.message}
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
