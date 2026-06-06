import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import {
  FiSend,
  FiPaperclip,
  FiX,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiTrash2,
  FiRefreshCw,
  FiMail,
} from "react-icons/fi";
import { format } from "date-fns";

const CustomEmailSender = () => {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewEmail, setViewEmail] = useState(null);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    fetchEmailHistory();
  }, [page]);

  const fetchEmailHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/email/history?page=${page}&limit=10`);
      setEmailHistory(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch email history:", error);
      toast.error("Failed to load email history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB limit
    );

    if (validFiles.length !== files.length) {
      toast.error("Some files were too large (max 10MB)");
    }

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!recipients || !subject || !body) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("recipients", recipients);
    formData.append("subject", subject);
    formData.append("body", body);

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      setIsSending(true);
      await api.post("/email/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Email sent successfully!");
      setRecipients("");
      setSubject("");
      setBody("");
      setAttachments([]);

      // Refresh email history
      fetchEmailHistory();
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to send email. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleViewEmail = async (id) => {
    try {
      const response = await api.get(`/email/history/${id}`);
      setViewEmail(response.data.data);
    } catch (error) {
      console.error("Failed to fetch email details:", error);
      toast.error("Failed to load email details");
    }
  };

  const handleDeleteEmail = async (id) => {
    if (!window.confirm("Are you sure you want to delete this email record?")) {
      return;
    }

    try {
      await api.delete(`/email/history/${id}`);
      toast.success("Email record deleted successfully");
      fetchEmailHistory();
    } catch (error) {
      console.error("Failed to delete email:", error);
      toast.error("Failed to delete email record");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="w-3 h-3 mr-1" />
            Sent
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiXCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Custom Email Sender
          </h1>
          <p className="text-gray-600 mt-1">
            Send custom emails with attachments to multiple recipients
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Composer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Compose Email
            </h2>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients *
                </label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple emails with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body (HTML supported) *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email content here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (Max 10MB each, Max 5 files)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <FiPaperclip className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF, DOC, DOCX, XLS, XLSX up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Selected Files:
                  </p>
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <FiPaperclip className="text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Send Email
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Email History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Email History
              </h2>
              <button
                onClick={fetchEmailHistory}
                className="text-indigo-600 hover:text-indigo-700"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="text-center py-8">
                <FiRefreshCw className="animate-spin mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-gray-500">Loading...</p>
              </div>
            ) : emailHistory.length === 0 ? (
              <div className="text-center py-8">
                <FiMail className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">No email history yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {emailHistory.map((email) => (
                  <div
                    key={email._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {email.subject}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          To: {email.recipients.join(", ")}
                        </p>
                      </div>
                      {getStatusBadge(email.status)}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {format(
                          new Date(email.createdAt),
                          "MMM dd, yyyy HH:mm",
                        )}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEmail(email._id)}
                          className="text-indigo-600 hover:text-indigo-700"
                          title="View details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmail(email._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-4">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Email Detail Modal */}
        {viewEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Email Details
                  </h3>
                  <button
                    onClick={() => setViewEmail(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <p className="mt-1 text-gray-900">{viewEmail.subject}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipients
                    </label>
                    <p className="mt-1 text-gray-900">
                      {viewEmail.recipients.join(", ")}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(viewEmail.status)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sent At
                    </label>
                    <p className="mt-1 text-gray-900">
                      {viewEmail.sentAt
                        ? format(
                            new Date(viewEmail.sentAt),
                            "MMM dd, yyyy HH:mm:ss",
                          )
                        : "Not sent yet"}
                    </p>
                  </div>

                  {viewEmail.attachments &&
                    viewEmail.attachments.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Attachments
                        </label>
                        <div className="mt-2 space-y-2">
                          {viewEmail.attachments.map((att, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <FiPaperclip className="text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {att.originalName}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({(att.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Body
                    </label>
                    <div
                      className="mt-1 p-4 bg-gray-50 rounded-lg text-gray-900"
                      dangerouslySetInnerHTML={{ __html: viewEmail.body }}
                    />
                  </div>

                  {viewEmail.error && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Error
                      </label>
                      <p className="mt-1 text-red-600">{viewEmail.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomEmailSender;
