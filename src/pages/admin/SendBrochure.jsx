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

      // Get the selected PDF details
      const allPdfs = [...pdfs.generated, ...pdfs.uploaded];
      const selectedPdfDetails = allPdfs.filter((pdf) =>
        selectedPdfs.includes(pdf.path)
      );

      // Send multiple PDFs in a single request
      const response = await api.post(
        "/pdfs/send-brochure",
        {
          pdfPaths: selectedPdfs,
          email: email.trim(),
          subject: subject.trim() || "Course Brochure",
          message: message.trim(),
          studentName: studentName.trim(),
          courseName: courseName.trim(),
          templateUsed: selectedTemplate,
          pdfDetails: selectedPdfDetails.map((pdf) => ({
            name: pdf.name,
            path: pdf.path,
            type: pdf.type,
            size: pdf.size,
          })),
        },
        {
          timeout: 60000 * selectedPdfs.length,
        }
      );

      // Save email record to database
      if (response.data && response.data.success) {
        try {
          await api.post("/emails/save-email-record", {
            to: email.trim(),
            subject: subject.trim() || "Course Brochure",
            message: message.trim(),
            studentName: studentName.trim(),
            courseName: courseName.trim(),
            templateUsed: selectedTemplate,
            attachments: selectedPdfDetails.map((pdf) => ({
              name: pdf.name,
              path: pdf.path,
              type: pdf.type,
              size: pdf.size,
            })),
            sentAt: new Date().toISOString(),
            status: "sent",
          });
        } catch (dbError) {
          console.error("Error saving email record:", dbError);
          // Don't fail the entire operation if saving to DB fails
          toast.error(
            "Email sent but failed to save record. Please check console for details."
          );
        }
      }

      toast.success("Brochure sent and record saved successfully!", {
        duration: 4000,
        icon: "🎉",
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });

      // Reset form but keep the PDF selected for convenience
      setEmail("");
      setStudentName("");
      setCourseName("");
      setSubject("");
      setMessage("");
      setSelectedTemplate("custom");
    } catch (error) {
      console.error("Error sending brochure:", error);
      // Try to save failed attempt to database
      try {
        const allPdfs = [...pdfs.generated, ...pdfs.uploaded];
        const selectedPdfDetails = allPdfs.filter((pdf) =>
          selectedPdfs.includes(pdf.path)
        );

        await api.post("/emails/save-email-record", {
          to: email.trim(),
          subject: subject.trim() || "Course Brochure",
          message: message.trim(),
          studentName: studentName.trim(),
          courseName: courseName.trim(),
          templateUsed: selectedTemplate,
          attachments: selectedPdfDetails.map((pdf) => ({
            name: pdf.name,
            path: pdf.path,
            type: pdf.type,
            size: pdf.size,
          })),
          sentAt: new Date().toISOString(),
          status: "failed",
          error: error.response?.data?.message || error.message,
        });
      } catch (dbError) {
        console.error("Error saving failed email record:", dbError);
      }

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
      custom: {
        name: "Custom",
        subject: `Write Custom Email or Select The Email Template For send`,
        content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  Write Custom Email or Select The Email Template For send
</div>
      `,
      },
      courseEnquiry: {
        name: "Course Enquiry",
        subject: `About {{courseName}} - <span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning`,
        content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p style="margin: 0 0 8px 0;">Dear {{studentName}},</p>

  <p style="margin: 0 0 8px 0;">
    Greetings from 
    <strong>
      <span style="color: rgb(244, 124, 38);">First</span>
      <span style="color: rgb(30, 144, 255);">VITE</span> E-Learning!
    </strong>
  </p>

  <p style="margin: 0 0 8px 0;">
    Are you looking to build a strong career in the domain of 
    <strong>{{courseName}}</strong>?  
    We are excited to introduce our <strong>{{courseName}}</strong> online training program,  
    designed for both beginners and professionals.
  </p>

  <h3 style="margin: 12px 0 6px 0; color: #222; font-size: 16px;">
    🌟 Course Highlights – {{courseName}}
  </h3>
  <ul style="margin: 0 0 12px 18px; padding: 0;">
    <li style="margin-bottom: 4px;">✅ 100% Online | Live + Recorded Classes</li>
    <li style="margin-bottom: 4px;">✅ Taught by Certified Professionals</li>
    <li style="margin-bottom: 4px;">✅ Real-time Case Studies & Projects</li>
    <li style="margin-bottom: 4px;">✅ Access to Server for Practical Training</li>
    <li style="margin-bottom: 4px;">✅ Resume Building + Interview Preparation</li>
    <li style="margin-bottom: 4px;">✅ Certificate from FirstVITE upon Completion</li>
  </ul>

  <h3 style="margin: 12px 0 6px 0; color: #222; font-size: 16px;">
    📅 Course Duration & Timings: 3 to 4 Months | Weekdays / Weekends Available
  </h3>

  <p style="margin: 0 0 8px 0;">💰 Special discounts available for early enrollment!</p>

  <p style="margin: 0 0 8px 0;">Looking forward to helping you take the next step in your career!</p>

  <p style="margin: 0 0 4px 0;">Warm regards,</p>
  <p style="margin: 0 0 4px 0;">
    Team – 
    <span style="color: rgb(244, 124, 38);">First</span>
    <span style="color: rgb(30, 144, 255);">VITE</span> E-Learning Pvt. Ltd.
  </p>
  <p style="margin: 0 0 4px 0;">📩 info@firstvite.com</p>
  <p style="margin: 0;">
    🌐 
    <a href="https://firstvite.com" style="color: rgb(30, 144, 255); text-decoration: none;">
      www.firstvite.com
    </a>
  </p>
</div>
      `,
      },
      webinarInvite: {
        name: "Learning Approach Invitation",
        subject: `Take the Next Step in Your Career with <span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning`,
        content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p style="margin: 0 0 8px 0;">Dear {{studentName}},</p>

  <p style="margin: 0 0 8px 0;">
    Greetings from 
    <span style="color: rgb(244, 124, 38);">First</span>
    <span style="color: rgb(30, 144, 255);">VITE</span> E-Learning Pvt. Ltd.!
  </p>

  <p style="margin: 0 0 8px 0;">
    We’re excited to invite you to enroll in one of our professional certification programs designed to help you enhance your skills and career growth.
  </p>

  <p style="margin: 0 0 8px 0;">
    At 
    <span style="color: rgb(244, 124, 38);">First</span>
    <span style="color: rgb(30, 144, 255);">VITE</span>, we offer a wide range of in-demand programs such as 
    <strong>Java</strong>, <strong>Python</strong>, <strong>AI & Machine Learning</strong>, 
    <strong>Cyber Security</strong>, <strong>Digital Marketing</strong>, <strong>SAP</strong>, 
    <strong>Power BI</strong>, <strong>Cloud Computing (Azure)</strong>, <strong>Salesforce</strong>, and more.
  </p>

  <p style="margin: 0 0 8px 0;">
    Each program is structured to provide hands-on learning with real-world applications — helping you gain the expertise needed to stand out in today’s competitive job market.
  </p>

  <p style="margin: 0 0 8px 0;">
    If you’re looking to upgrade your skills or switch to a high-growth career path, this is the perfect time to get started!
  </p>

  <p style="margin: 0 0 8px 0;">
    Please feel free to reply to this email or contact us directly for more details about the courses, duration, and fee structure.
  </p>

  <p style="margin: 0 0 8px 0;">
    Looking forward to helping you begin your learning journey with us.
  </p>

  <p style="margin: 0 0 4px 0;">Warm regards,</p>
  <p style="margin: 0 0 4px 0;">
    Team – 
    <span style="color: rgb(244, 124, 38);">First</span>
    <span style="color: rgb(30, 144, 255);">VITE</span> E-Learning Pvt. Ltd.
  </p>
  <p style="margin: 0 0 4px 0;">📩 info@firstvite.com</p>
  <p style="margin: 0;">
    🌐 
    <a href="https://firstvite.com" style="color: rgb(30, 144, 255); text-decoration: none;">
      www.firstvite.com
    </a>
  </p>
</div>
`,
      },
      videoSender: {
        name: "Video Sender",
        subject: `Take the Next Step in Your Career with <span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning`,
        content: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <p style="margin: 0 0 8px 0;">Dear {{studentName}},</p>

  <p style="margin: 0 0 8px 0;">
    Greetings from 
    <span style="color: rgb(244, 124, 38)">First</span>
    <span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.!
  </p>

  <p style="margin: 0 0 8px 0;">
    We’re excited to invite you to enroll in one of our professional certification programs designed to help you enhance your skills and career growth.
  </p>

  <p style="margin: 0 0 8px 0;">
    At 
    <span style="color: rgb(244, 124, 38)">First</span>
    <span style="color: rgb(30, 144, 255)">VITE</span>, we offer a wide range of in-demand programs such as 
    <strong>Java</strong>, <strong>Python</strong>, <strong>AI & Machine Learning</strong>, 
    <strong>Cyber Security</strong>, <strong>Digital Marketing</strong>, <strong>SAP</strong>, 
    <strong>Power BI</strong>, <strong>Cloud Computing (Azure)</strong>, <strong>Salesforce</strong>, and more.
  </p>

  <p style="margin: 0 0 8px 0;">
    Each program is structured to provide hands-on learning with real-world applications — helping you gain the expertise needed to stand out in today’s competitive job market.
  </p>

  <p style="margin: 0 0 8px 0;">
    If you’re looking to upgrade your skills or switch to a high-growth career path, this is the perfect time to get started!
  </p>

  <p style="margin: 0 0 8px 0;">
    Please feel free to reply to this email or contact us directly for more details about the courses, duration, and fee structure.
  </p>

  <p style="margin: 0 0 8px 0;">
    Looking forward to helping you begin your learning journey with us.
  </p>

  <p style="margin: 0 0 4px 0;">Warm regards,</p>
  <p style="margin: 0 0 4px 0;">
    Team – 
    <span style="color: rgb(244, 124, 38)">First</span>
    <span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.
  </p>
  <p style="margin: 0 0 4px 0;">📩 info@firstvite.com</p>
  <p style="margin: 0;">🌐 <a href="https://firstvite.com" style="color: rgb(30, 144, 255); text-decoration: none;">www.firstvite.com</a></p>
</div>
`,
      },
      allCoursesProposal: {
        name: "All Courses Proposal",
        subject: `Proposal for Student Skill Development & Certification Programs – <span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd`,
        content: `
<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
  <p style="margin: 0 0 8px 0;">
    Dear {{studentName}},
  </p>

  <p style="margin: 0 0 8px 0;">
    Warm greetings from 
    <span style="color: rgb(244, 124, 38)">First</span>
    <span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.
  </p>

  <p style="margin: 0 0 8px 0;">
    We are pleased to introduce 
    <span style="color: rgb(244, 124, 38)">First</span>
    <span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd., a leading online learning platform focused on delivering high-quality certification programs designed to enhance students’ employability and industry readiness.
  </p>

  <p style="margin: 0 0 8px 0;">
    We would like to propose a collaboration (tie-up) with <strong>{{courseName}}</strong>, to offer a range of industry-relevant certification programs for your students. These programs are structured and delivered by our expert trainers who possess extensive experience in their respective domains.
  </p>

  <p style="margin: 8px 0;"><strong>Courses We Offer</strong></p>

  <ul style="margin: 0 0 8px 20px; padding: 0;">
    <li>Java Programming</li>
    <li>Python Programming</li>
    <li>SAP (Enterprise Management System)</li>
    <li>Artificial Intelligence & Machine Learning</li>
    <li>Cyber Security</li>
    <li>Database Management</li>
    <li>Digital Marketing</li>
    <li>Game Development</li>
    <li>Microsoft Azure (Cloud Computing)</li>
    <li>Salesforce (CRM Platform)</li>
    <li>Android App Development</li>
    <li>Power BI (Business Analytics)</li>
  </ul>

  <p style="margin: 0 0 8px 0;">
    Additionally, we also provide free value-added short courses to help students strengthen their profiles and gain an edge in their career journey.
  </p>

  <p style="margin: 8px 0;"><strong>Key Highlights of Our Programs</strong></p>

  <ul style="margin: 0 0 8px 20px; padding: 0;">
    <li>100% Online Learning (Live + Recorded Classes)</li>
    <li>Delivered by Industry Experts from FirstVite</li>
    <li>Practical, Project-Based Learning</li>
    <li>Certification from FirstVite E-Learning Pvt. Ltd.</li>
    <li>Placement Guidance and Career Support</li>
    <li>Internship Assistance (where applicable)</li>
  </ul>

  <p style="margin: 8px 0;"><strong>Proposal for Tie-Up</strong></p>

  <p style="margin: 0 0 8px 0;">
    We are looking forward to forming a strategic academic partnership with your institution. Through this collaboration, Royal Educational Institute students will gain access to our certified programs at special institutional pricing and benefit from joint skill enhancement initiatives like webinars, workshops, and hackathons.
  </p>

  <p style="margin: 0 0 8px 0;">
    We truly believe this partnership will help bridge the gap between academic learning and industry expectations, empowering your students with the skills needed to succeed in today’s competitive job market.
  </p>

  <p style="margin: 0 0 8px 0;">
    If this proposal aligns with your vision, we would be happy to schedule a meeting or presentation to discuss the details further.
  </p>

  <p style="margin: 0 0 8px 0;">Looking forward to your positive response and a fruitful collaboration.</p>

  <p style="margin: 0 0 4px 0;">Warm regards,</p>
  <p style="margin: 0 0 4px 0;">
    Team <span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span>
  </p>
  <p style="margin: 0 0 4px 0;">
    <span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.
  </p>
  <p style="margin: 0 0 4px 0;">📧 info@firstvite.com</p>
  <p style="margin: 0;">📞 +91-9990056799 | 🌐 www.firstvite.com</p>
</div>
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

  const [selectedTemplate, setSelectedTemplate] = useState("custom");

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
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Pradeep Mishra / Manipal Placement Cell"
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
                    Recipient (College / University / Organizations /
                    Consultancy / Course) Name
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g., Manipal University / Manipal College"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Email Template
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

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mail Subject
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

                <label className="block text-sm font-medium text-gray-700 mb-1 mt-5">
                  Mail Message
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
                    <div
                      className="max-w-none text-sm bg-gray-50 p-4 rounded-md border border-gray-100 shadow-sm"
                      style={{
                        fontFamily: "Arial, sans-serif",
                        lineHeight: "1.6",
                        color: "#333",
                        fontSize: "14px",
                      }}
                    >
                      {message ? (
                        <div
                          className="email-preview"
                          style={{
                            backgroundColor: "#fff",
                            padding: "16px",
                            borderRadius: "6px",
                            boxShadow: "0 0 6px rgba(0,0,0,0.05)",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: message
                              .replace(/\n/g, "<br>")
                              // Make sure paragraph spacing looks natural
                              .replace(
                                /<p>/g,
                                '<p style="margin: 0 0 8px 0; line-height: 1.6; font-size: 14px;">'
                              )
                              // Make lists look clean
                              .replace(
                                /<ul>/g,
                                '<ul style="margin: 8px 0 8px 20px; padding: 0; font-size: 14px;">'
                              )
                              .replace(
                                /<li>/g,
                                '<li style="margin-bottom: 4px; line-height: 1.5;">'
                              )
                              // Adjust heading styling for better hierarchy
                              .replace(
                                /<h3>/g,
                                '<h3 style="font-size:16px; margin:12px 0 6px 0; color:#222;">'
                              ),
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
