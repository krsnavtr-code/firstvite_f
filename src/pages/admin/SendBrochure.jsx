import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import {
  FiSend,
  FiFileText,
  FiMail,
  FiType,
  FiMessageSquare,
} from "react-icons/fi";

const SendBrochure = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Course Brochure");
  const [message, setMessage] = useState(
    "Please find attached the course brochure you requested."
  );
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        setLoading(true);
        // Get the list of available PDFs from our new endpoint
        const response = await api.get("/pdfs");
        setPdfs(response.data);
      } catch (error) {
        console.error("Error fetching PDFs:", error);
        toast.error("Failed to load PDFs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPdf) {
      toast.error("Please select a PDF to send");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSending(true);

      // Use our new endpoint for sending brochures
      await api.post("/pdfs/send-brochure", {
        pdfPath: selectedPdf,
        email: email.trim(),
        subject: subject.trim() || "Course Brochure",
        message: message.trim(),
      });

      toast.success("Brochure sent successfully!", {
        duration: 4000,
        icon: "🎉",
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });

      // Reset form but keep the PDF selected for convenience
      setEmail("");
      setSubject("Course Brochure");
      setMessage("Please find attached the course brochure you requested.");
    } catch (error) {
      console.error("Error sending brochure:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to send brochure. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // Format file size to human readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiSend className="mr-2 text-indigo-600" />
              Send Course Brochure
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Select a course brochure and send it via email to potential
              students or clients.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="pdf"
                className="block text-sm font-medium text-gray-700 flex items-center"
              >
                <FiFileText className="mr-2" />
                Select Brochure
              </label>

              {loading ? (
                <div className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : (
                <select
                  id="pdf"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={selectedPdf}
                  onChange={(e) => setSelectedPdf(e.target.value)}
                  required
                >
                  <option value="">-- Select a brochure to send --</option>
                  {pdfs.map((pdf) => (
                    <option key={pdf.path} value={pdf.path}>
                      {pdf.name.replace(/_/g, " ").replace(/\.pdf$/i, "")} •{" "}
                      {formatFileSize(pdf.size)} •{" "}
                      {new Date(pdf.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}

              {pdfs.length === 0 && !loading && (
                <p className="mt-2 text-sm text-amber-600">
                  No brochures found. Please generate some course brochures
                  first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 flex items-center"
              >
                <FiMail className="mr-2" />
                Recipient Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@example.com"
                required
              />
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
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
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={sending || loading}
              >
                {sending ? "Sending..." : "Send Brochure"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendBrochure;
