import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../../api/axios";
import {
  FiSend,
  FiFileText,
  FiMail,
  FiType,
  FiMessageSquare,
  FiUpload,
  FiFilePlus,
  FiList,
  FiUser,
  FiBook,
} from "react-icons/fi";

const SendBrochure = () => {
  const [pdfs, setPdfs] = useState({ generated: [], uploaded: [] });
  const [selectedPdf, setSelectedPdf] = useState("");
  const [email, setEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [subject, setSubject] = useState("Course Brochure");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("generated");
  const navigate = useNavigate();



  // const duration = "2.5 to 3 Months";

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        setLoading(true);
        // Get the list of available PDFs from our endpoint
        const response = await api.get("/pdfs");

        // Separate the PDFs by type
        const generated = response.data.filter(
          (pdf) => pdf.type === "generated"
        );
        const uploaded = response.data.filter((pdf) => pdf.type === "uploaded");

        setPdfs({ generated, uploaded });

        // If no PDFs are selected and there are PDFs available, select the first one
        if (!selectedPdf && (generated.length > 0 || uploaded.length > 0)) {
          if (activeTab === "generated" && generated.length > 0) {
            setSelectedPdf(generated[0].path);
          } else if (activeTab === "uploaded" && uploaded.length > 0) {
            setSelectedPdf(uploaded[0].path);
          }
        }
      } catch (error) {
        console.error("Error fetching PDFs:", error);
        toast.error("Failed to load PDFs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, [activeTab]);

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

      // Use our new endpoint for sending brochures with increased timeout
      await api.post("/pdfs/send-brochure", {
        pdfPath: selectedPdf,
        email: email.trim(),
        subject: subject.trim() || "Course Brochure",
        message: message.trim(),
      }, {
        timeout: 60000 // 60 seconds timeout
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
  // Message template for uploaded brochures
 const messageTemplate = useMemo(() => {
   return `
<p>Dear {{studentName}},</p>

<p>Greetings from <strong>FirstVITE E-Learning!</strong></p>

<p>
Are you looking to build a strong career in the domain of <strong>{{courseName}}</strong>?  
We are excited to introduce our <strong>{{courseName}}</strong> online training program,  
designed for both beginners and professionals.
</p>

<h3>🌟 Course Highlights – {{courseName}}</h3>
<ul>
  <li>✅ 100% Online | Live + Recorded Classes</li>
  <li>✅ Taught by Certified Professionals</li>
  <li>✅ Real-time Case Studies & Projects</li>
  <li>✅ Access to Server for Practical Training</li>
  <li>✅ Resume Building + Interview Preparation</li>
  <li>✅ Certificate from FirstVITE upon Completion</li>
</ul>

<h3>📅 Course Duration & Timings:</h3>
<ul>
  <li><strong>Mode:</strong> Online Recorded & Live Classes</li>
  <li><strong>Schedule:</strong> Flexible (Weekdays/Weekends Available)</li>
  <li><strong>Language:</strong> Hindi + English</li>
</ul>

<h3>💼 Career Scope after {{courseName}}:</h3>

<h3>💰 Course Fee & Offers:</h3>
<p>Special discounts available for early enrollment!</p>

<p>
Looking forward to helping you take the next step in your career!
</p>
  `;
 }, []);


  // Update message when template variables change
  useEffect(() => {
    if (activeTab === "uploaded") {
      let updatedMessage = messageTemplate;
      updatedMessage = updatedMessage.replace(
        /\{\{studentName\}\}/g,
        studentName || "Student"
      );
      updatedMessage = updatedMessage.replace(
        /\{\{courseName\}\}/g,
        courseName || "this course"
      );
      setMessage(updatedMessage);

      // Update subject if it's the default
      if (subject === "Course Brochure" && courseName) {
        setSubject(`About ${courseName} - FirstVITE E-Learning`);
      }
    }
  }, [activeTab, studentName, courseName, messageTemplate]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get the current list of PDFs based on active tab
  const currentPdfs =
    activeTab === "generated" ? pdfs.generated : pdfs.uploaded;
  const hasPdfs = currentPdfs.length > 0;
  const totalPdfs = pdfs.generated.length + pdfs.uploaded.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FiSend className="mr-2 text-indigo-600" />
                  Send Brochure
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Select a brochure and send it via email to potential students
                  or clients.
                </p>
              </div>
              <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                {totalPdfs} brochures available
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                type="button"
                onClick={() => setActiveTab("generated")}
                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "generated"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center">
                  <FiFileText className="mr-2" />
                  Generated Brochures
                  {pdfs.generated.length > 0 && (
                    <span className="ml-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {pdfs.generated.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("uploaded")}
                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "uploaded"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center">
                  <FiUpload className="mr-2" />
                  Uploaded Brochures
                  {pdfs.uploaded.length > 0 && (
                    <span className="ml-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {pdfs.uploaded.length}
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="pdf"
                className="block text-sm font-medium text-gray-700 flex items-center"
              >
                {activeTab === "generated" ? (
                  <FiFileText className="mr-2" />
                ) : (
                  <FiUpload className="mr-2" />
                )}
                {activeTab === "generated"
                  ? "Select Generated Brochure"
                  : "Select Uploaded Brochure"}
              </label>

              {loading ? (
                <div className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : hasPdfs ? (
                <select
                  id="pdf"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={selectedPdf}
                  onChange={(e) => setSelectedPdf(e.target.value)}
                  required
                >
                  <option value="">-- Select a brochure to send --</option>
                  {currentPdfs.map((pdf) => (
                    <option key={pdf.path} value={pdf.path}>
                      {pdf.name.replace(/_/g, " ").replace(/\.pdf$/i, "")} •{" "}
                      {formatFileSize(pdf.size)} •{" "}
                      {new Date(pdf.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <FiFilePlus className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No {activeTab} brochures found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === "generated"
                      ? "Generate some brochures first."
                      : "Upload brochures to the public/uploaded_brochure directory."}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {activeTab === "uploaded" && (
                  <div className="space-y-2">
                    <label
                      htmlFor="studentName"
                      className="block text-sm font-medium text-gray-700 flex items-center"
                    >
                      <FiUser className="mr-2" />
                      Student Name
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter student's name"
                      required={activeTab === "uploaded"}
                    />
                  </div>
                )}
              </div>

              {activeTab === "uploaded" && (
                <div className="space-y-2">
                  <label
                    htmlFor="courseName"
                    className="block text-sm font-medium text-gray-700 flex items-center"
                  >
                    <FiBook className="mr-2" />
                    Course Name
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g., SAP SD (Sales & Distribution)"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <div className="mb-2 text-xs text-gray-500">
                  Use {"{{studentName}}"} and {"{{courseName}}"} as placeholders
                  that will be replaced with actual values.
                </div>
                <div className="h-64 mb-4">
                  <ReactQuill
                    theme="snow"
                    value={message}
                    onChange={setMessage}
                    className="h-48 bg-white"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                        ["clean"],
                      ],
                    }}
                    placeholder="Enter your message here..."
                  />
                </div>

                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Email Preview:
                  </h4>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="prose max-w-none text-sm text-gray-700">
                      {message ? (
                        <div
                          className="whitespace-pre-wrap"
                          style={{
                            fontFamily: "sans-serif",
                            lineHeight: "1.5",
                            whiteSpace: "pre-wrap",
                            wordWrap: "break-word",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: message.replace(/\n/g, "<br>"),
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 italic">
                          Your message will appear here...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
