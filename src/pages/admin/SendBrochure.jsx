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
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [subject, setSubject] = useState("Course Brochure");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("generated");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        setLoading(true);
        const response = await api.get("/pdfs");
        const generated = response.data.filter(
          (pdf) => pdf.type === "generated"
        );
        const uploaded = response.data.filter((pdf) => pdf.type === "uploaded");
        setPdfs({ generated, uploaded });
      } catch (error) {
        console.error("Error fetching PDFs:", error);
        toast.error("Failed to load PDFs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, [activeTab]);

  const handlePdfSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedPdfs(selectedOptions);
  };

  const filteredPdfs = useMemo(() => {
    const currentPdfs =
      activeTab === "generated" ? pdfs.generated : pdfs.uploaded;
    if (!searchTerm.trim()) return currentPdfs;

    const term = searchTerm.toLowerCase();
    return currentPdfs.filter(
      (pdf) =>
        pdf.name.toLowerCase().includes(term) ||
        pdf.path.toLowerCase().includes(term)
    );
  }, [activeTab, pdfs, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPdfs.length === 0) {
      toast.error("Please select at least one PDF to send");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSending(true);

      // Send multiple PDFs in a single request
      await api.post(
        "/pdfs/send-brochure",
        {
          pdfPaths: selectedPdfs, // Changed to match backend's expected field name
          email: email.trim(),
          subject: subject.trim() || "Course Brochure",
          message: message.trim(),
        },
        {
          timeout: 60000 * selectedPdfs.length, // Increase timeout based on number of PDFs
        }
      );

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

  // Message templates for different scenarios
  const messageTemplates = useMemo(
    () => ({
      courseEnquiry: {
        name: "Course Enquiry",
        subject: `About {{courseName}} - FirstVITE E-Learning`,
        content: `
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

<h3>📅 Course Duration & Timings: 3 to 4 Months, Weekdays/Weekends Available</h3>
<p>Special discounts available for early enrollment!</p>
<p>Looking forward to helping you take the next step in your career!</p>

<p>Warm regards,</p>
<p>Team – FirstVITE E-Learning Pvt. Ltd.</p>
<p>📩 info@firstvite.com</p>
<p>🌐 https://firstvite.com</p>
      `,
      },
      webinarInvite: {
        name: "Learning Approach Invitation",
        subject: `Take the Next Step in Your Career with FirstVITE E-Learning`,
        content: `
<p>Dear {{studentName}},</p>

<p>Greetings from FirstVITE E-Learning Pvt. Ltd.!</p>

<p>We’re excited to invite you to enroll in one of our professional certification programs designed to help you enhance your skills and career growth.</p>

<p>At FirstVITE, we offer a wide range of in-demand programs such as Java, Python, AI & Machine Learning, Cyber Security, Digital Marketing, SAP, Power BI, Cloud Computing (Azure), Salesforce, and more.</p>

<p>Each program is structured to provide hands-on learning with real-world applications—helping you gain the expertise needed to stand out in today’s competitive job market.</p>

<p>If you’re looking to upgrade your skills or switch to a high-growth career path, this is the perfect time to get started!</p>

<p>Please feel free to reply to this email or contact us directly for more details about the courses, duration, and fee structure.</p>

<p>Looking forward to helping you begin your learning journey with us.</p>

<p>Warm regards,</p>
<p>Team – FirstVITE E-Learning Pvt. Ltd.</p>
<p>📩 info@firstvite.com</p>
<p>🌐 https://firstvite.com</p>
`,
      },
      custom: {
        name: "Custom Message",
        subject: "",
        content: "",
      },
    }),
    []
  );

  const [selectedTemplate, setSelectedTemplate] = useState("courseEnquiry");

  // Update message when template or variables change
  useEffect(() => {
    if (activeTab === "uploaded") {
      const template = messageTemplates[selectedTemplate];

      // Replace variables in content
      let updatedContent = template.content
        .replace(/\{\{studentName\}\}/g, studentName || "Student")
        .replace(/\{\{courseName\}\}/g, courseName || "this course");

      // Replace variables in subject
      let updatedSubject = template.subject
        .replace(/\{\{studentName\}\}/g, studentName || "Student")
        .replace(/\{\{courseName\}\}/g, courseName || "this course");

      setMessage(updatedContent);

      // Only update subject if it hasn't been manually modified or is empty
      if (
        subject === "" ||
        subject === "Course Brochure" ||
        subject.startsWith("About ") ||
        subject.startsWith("Following up")
      ) {
        setSubject(updatedSubject);
      }
    }
  }, [
    activeTab,
    studentName,
    courseName,
    selectedTemplate,
    messageTemplates,
    subject,
  ]);

  // Handle template change
  const handleTemplateChange = (e) => {
    const templateKey = e.target.value;
    setSelectedTemplate(templateKey);

    // Only update message if not custom template
    if (templateKey !== "custom") {
      const template = messageTemplates[templateKey];
      setMessage(template.content);
      setSubject(template.subject);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const hasPdfs =
    (activeTab === "generated" ? pdfs.generated : pdfs.uploaded).length > 0;
  const totalPdfs = pdfs.generated.length + pdfs.uploaded.length;
  const selectedCount = selectedPdfs.length;

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

            <div className="space-y-4">
              {/* Search Box */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search brochures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-md">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : hasPdfs ? (
                <select
                  id="pdf"
                  multiple
                  size={Math.min(6, Math.max(3, filteredPdfs.length))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={selectedPdfs}
                  onChange={handlePdfSelection}
                  required
                >
                  {filteredPdfs.map((pdf) => (
                    <option key={pdf.path} value={pdf.path}>
                      {pdf.name.replace(/_/g, " ").replace(/\.pdf$/i, "")} •{" "}
                      {formatFileSize(pdf.size)} •{" "}
                      {new Date(pdf.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    No {activeTab} brochures found.
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    {Object.entries(messageTemplates).map(([key, template]) => (
                      <option key={key} value={key}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <div className="mb-2 text-xs text-red-600">
                  Use {"{{studentName}}"} and {"{{courseName}}"} as placeholders
                  that will be replaced with actual values.
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  You can edit the email content in the editor below
                </p>
                <div className="h-64 mb-4">
                  <ReactQuill
                    theme="snow"
                    value={message}
                    onChange={setMessage}
                    className="h-48 bg-white text-gray-700"
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
                    <div className="prose max-w-none text-sm text-green-600">
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
          </div>
        </form>
      </div>
    </div>
    // </div>
  );
};

export default SendBrochure;
