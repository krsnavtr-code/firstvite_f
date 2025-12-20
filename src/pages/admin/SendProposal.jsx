import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "../../api/axios";
import { FiSend, FiRefreshCw, FiPaperclip, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

// --- Configuration & Templates ---
const EMAIL_TEMPLATES = {
  collegeInvitationMessage: `<div style="font-size: 16px;">
Dear [College Name],

Greetings from <span style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</span>!

Skill Development company dedicated to enhancing student employability through practical and industry-aligned courses.

At <span style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</span>!, we specialize in training students in high-demand technical skills including:

🔹 Java Development
🔹 Python Programming
🔹 Web Development (HTML, CSS, JavaScript, React, etc.)
🔹 Android App Development
🔹 Other Skill-Based Courses (as per industry trends)

Our mission is to bridge the skill gap between academic knowledge and industry requirements so that students become job-ready and confident in their careers.

We would like to collaborate with your esteemed institution to:
✔ Provide advanced skill training to your students
✔ Increase their chances of placements and internships
✔ Conduct workshops, bootcamps, and live project sessions
✔ Guide them in real-world applications and career paths

We believe this partnership can significantly benefit your students by giving them a head start in emerging technologies and practical job skills.

We would be grateful if you could share this training opportunity with your student community or allow us to meet your placement/training team to discuss this collaboration further.

Looking forward to your positive response.

Thank you & Best Regards,
<span style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</span>
📞 <span style="font-weight: 600; color: #007BFF;">9990056799 | 855980758</span> 
📧 <span style="font-weight: 600; color: #007BFF;">info@firstvite.com</span>
🌐 <span style="font-weight: 600; color: #007BFF;">https://firstvite.com</span>
</div>`,

  studentMessage: `<div style="color: #4DA3FF; font-size: 18px;">
Dear Student,

Greetings from <span style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</span>!

We are excited to invite you to participate in our upcoming Career Hiring Camp 2025, a unique platform where you can connect directly with leading companies that are hiring fresh graduates and final-year students.

This event is designed to help you kickstart your career journey with opportunities for:
• On-the-spot interviews and job offers
• Internship and placement opportunities
• Skill-building sessions by industry experts
• Networking with recruiters from reputed organizations

🎯 <span style="font-weight: 600;">Why You Should Join:</span>
• 100% Free Registration
• Certificate of Participation
• Real Hiring Exposure

📝 <span style="font-weight: 600;">Register Now:</span>
Click the link below to secure your spot:
👉 <span style="font-weight: 600; color: #007BFF;"><a href="https://firstvite.com/jobfair/apply/student">Register Now</a></span>

📅 Event Details will be sent to your email after registration.
Organized by: <span style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</span>

Don't miss this golden opportunity to get noticed by hiring companies and start your professional journey.
We look forward to seeing you at the event!

Warm regards,
<strong style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</strong>
📞 <span style="font-weight: 600; color: #007BFF;">9990056799</span> 
📧 <span style="font-weight: 600; color: #007BFF;">info@firstvite.com</span>
🌐 <span style="font-weight: 600; color: #007BFF;">https://firstvite.com</span>
</div>`,

  collegeMessage: `<div style="color: #4DA3FF; font-size: 18px;">
Dear [College Name],

Greetings from <span style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</span>!

We are delighted to inform you that we are organizing a Career Hiring Camp in collaboration with several leading partner companies who are actively recruiting fresh graduates and final-year students.

The objective of this initiative is to bridge the gap between education and employment by connecting talented students directly with hiring partners and offering them career guidance, interview exposure, and skill-building sessions — all under one platform.

Your esteemed institution’s participation in this camp would provide your students with:
Direct interaction with multiple hiring companies
Access to real job and internship opportunities
Free participation (no registration or hidden fees)
Certificates and recognition for participants

To participation provide this to your students, please fill out the short form below:
👉 <span style="font-weight: 600; color: #007BFF;"><a href="https://firstvite.com/jobfair/apply/student">Register Now</a></span>

Our team will get in touch with you for further coordination and provide detailed schedules.
We look forward to having your institution join us in empowering the next generation of professionals.

Warm regards,
<span style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</span>
📞 <span style="font-weight: 600; color: #007BFF;">9990056799</span> 
📧 <span style="font-weight: 600; color: #007BFF;">info@firstvite.com</span>
🌐 <span style="font-weight: 600; color: #007BFF;">https://firstvite.com</span>
</div>`,

  companyMessage: `<div style="color: #4DA3FF; font-size: 18px;">
Dear [Company Name],

We are excited to announce that <span style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</span>! are organizing a Job Fair which will bring together over 👥1,500+ students from multiple leading colleges/universities.

The objective of this initiative is to bridge the gap between education and employment by connecting talented students directly with hiring partners and offering them career guidance, interview exposure, and skill-building sessions — all under one platform.

This event presents a unique opportunity for your company to:
✅ Engage with top talent across diverse streams.
✅ Showcase your organization and upcoming career opportunities.
✅ Conduct on-the-spot interviews and networking sessions with prospective candidates.
✅ Promote your company brand among job seekers.
✅ Access to fresh & skilled candidates.

We would be honoured to have participate in this Job Fair and connect with some of the brightest emerging professionals. We are committed to providing a seamless experience for all participating companies, including dedicated space for your representatives, and structured interaction with students.

🏫 For Registration kindly fill out this short form:
👉 <span style="font-weight: 600; color: #007BFF;">
<a href="https://firstvite.com/jobfair/apply/company">Register Now</a></span>

💼 Participation Fee: ₹4000 + GST (includes personal hiring space)

For details and bookings, feel free to contact:

Warm regards,
<span style="font-weight: 600;"><span style="color: rgb(244, 124, 38)">First</span><span style="color: rgb(30, 144, 255)">VITE</span> E-Learning Pvt. Ltd.</span>
📞 <span style="font-weight: 600; color: #007BFF;">9990056799</span> 
📧 <span style="font-weight: 600; color: #007BFF;">info@firstvite.com</span>
🌐 <span style="font-weight: 600; color: #007BFF;">https://firstvite.com</span>
</div>`,
};

const MESSAGE_OPTIONS = [
  {
    id: "student",
    label: "Message for Student",
    field: "studentMessage",
  },
  {
    id: "college",
    label: "Message for College/University",
    field: "collegeMessage",
    note: "(Remember to change [College Name])",
  },
  {
    id: "company",
    label: "Message for Company",
    field: "companyMessage",
    note: "(Remember to change [Company Name])",
  },
  {
    id: "collegeInvitation",
    label: "College Invitation (Student Program)",
    field: "collegeInvitationMessage",
    note: "(Remember to change [College Name])",
  },
];

const SendProposal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      messageType: "student",
      subject: "Invitation from | FirstVITE E-Learning Pvt. Ltd.",
      ...EMAIL_TEMPLATES, 
    },
  });

  const currentMessageType = watch("messageType");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();

      // Better email parsing: splits by newlines AND commas
      const emailList = data.emails
        .split(/[\n,]+/)
        .map((email) => email.trim())
        .filter((email) => email);

      if (emailList.length === 0) {
        toast.error("Please enter at least one valid email.");
        return;
      }

      // Determine the active message content based on selection
      const activeField = MESSAGE_OPTIONS.find(
        (opt) => opt.id === data.messageType
      )?.field;
      const finalMessage = data[activeField];

      const emailData = {
        emails: emailList,
        subject: data.subject,
        message: finalMessage,
      };

      // Append Files
      files.forEach((file) => formData.append("attachments", file));

      // Append Data
      formData.append("data", JSON.stringify(emailData));

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const toastId = toast.loading("Sending emails...");

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
        timeout: 120000,
      });

      if (response.data && response.data.status === "success") {
        toast.success(response.data.message || "Proposal sent successfully!", {
          id: toastId,
        });

        // Reset only emails and files, keep the message templates
        setValue("emails", "");
        setFiles([]);
      } else {
        throw new Error(response.data?.message || "Failed to send proposal");
      }
    } catch (error) {
      console.error("Error sending proposal:", error);

      // Handle Timeout specifically
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        toast.success("Request processed in background.", { duration: 4000 });
        setValue("emails", "");
        setFiles([]);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to send proposal."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      const newFiles = Array.from(e.target.files);

      const validFiles = newFiles.filter((file) => {
        if (file.size > MAX_SIZE) {
          toast.error(`${file.name} is too large (Max 10MB)`);
          return false;
        }
        return true;
      });

      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetTemplate = (field) => {
    if (
      window.confirm("Reset this message to the original default template?")
    ) {
      setValue(field, EMAIL_TEMPLATES[field]);
      toast.success("Template reset to default");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Send Proposal</h1>
        <Link
          to="/admin/email-records"
          className="mt-2 sm:mt-0 flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors font-medium"
        >
          <FiSend className="mr-2" /> Sent History
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Input */}
        <div>
          <label
            htmlFor="emails"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Recipients (Emails)
          </label>
          <textarea
            id="emails"
            {...register("emails", {
              required: "At least one email is required",
            })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            placeholder="college1@example.com&#10;college2@example.com"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate emails by new line or comma.
          </p>
          {errors.emails && (
            <p className="text-red-500 text-sm mt-1">{errors.emails.message}</p>
          )}
        </div>

        {/* Subject Input */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Email Subject
          </label>
          <input
            type="text"
            id="subject"
            {...register("subject", { required: "Subject is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">
              {errors.subject.message}
            </p>
          )}
        </div>

        {/* Message Type Selection (Dynamic Rendering) */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Select Message Template
          </label>

          <div className="grid grid-cols-1 gap-4">
            {MESSAGE_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                  currentMessageType === option.id
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <label className="flex items-start space-x-3 cursor-pointer w-full">
                  <input
                    type="radio"
                    {...register("messageType")}
                    value={option.id}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {option.label}
                        {option.note && (
                          <span className="text-red-500 text-xs ml-2 font-normal">
                            {option.note}
                          </span>
                        )}
                      </span>
                      {currentMessageType === option.id && (
                        <button
                          type="button"
                          onClick={() => resetTemplate(option.field)}
                          className="text-xs flex items-center text-gray-500 hover:text-indigo-600"
                          title="Reset to default template"
                        >
                          <FiRefreshCw className="mr-1" /> Reset Default
                        </button>
                      )}
                    </div>

                    {/* Render Text Area only if selected */}
                    {currentMessageType === option.id && (
                      <div className="mt-3 animate-fadeIn">
                        <textarea
                          {...register(option.field, {
                            required: "Message content is required",
                          })}
                          rows={12}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed"
                          placeholder={`Enter ${option.label}...`}
                        />
                        {errors[option.field] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[option.field].message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Attachments
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
            <div className="space-y-1 text-center">
              <FiPaperclip className="mx-auto h-10 w-10 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
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
                Docs, Images, PDF up to 10MB
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Selected Files
              </h4>
              <ul className="grid grid-cols-1 gap-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center truncate">
                      <FiPaperclip className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiX />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <FiSend className="mr-2" /> Send Proposal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendProposal;
