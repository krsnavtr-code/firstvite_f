import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaPhone, FaWhatsapp, FaUsers } from "react-icons/fa";
import SEO from "../../components/SEO";

const StudentTestimonialsThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  return (
    <>
      <SEO
        title="Thank You | Connect with Alumni - Request Submitted"
        description="Thank you for your request to connect with our alumni! We'll help you get in touch with our learners to know more about their experience."
        keywords="thank you, connect with alumni, student testimonials, Eklabya"
        robots="noindex, nofollow"
      />
      <div className="min-h-screen bg-gradient-to-br from-[#0B1C3F] via-[#1A3D8F] to-[#0B1C3F] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <FaCheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1C3F] mb-4">
            Request Submitted Successfully!
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            {state?.message || "Thank you for your interest in connecting with our alumni! We'll help you get in touch with our learners to know more about their experience."}
          </p>

          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-[#0B1C3F] mb-4">What happens next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-gray-700">Our team will review your request</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-gray-700">We'll connect you with relevant alumni/learners</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-gray-700">Get authentic insights about our programs</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="tel:+919891030303"
              className="flex items-center justify-center gap-2 bg-[#0B1C3F] text-white py-3 px-6 rounded-lg hover:bg-[#1A3D8F] transition-colors font-semibold"
            >
              <FaPhone />
              Call Us Now
            </a>
            <a
              href="https://wa.me/919891030303?text=Hi%2C%20I%20want%20to%20connect%20with%20alumni%20to%20know%20more%20about%20the%20program"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-6 rounded-lg hover:bg-[#128C7E] transition-colors font-semibold"
            >
              <FaWhatsapp />
              WhatsApp Us
            </a>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => navigate("/success-stories")}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Student Testimonials
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentTestimonialsThankYou;
