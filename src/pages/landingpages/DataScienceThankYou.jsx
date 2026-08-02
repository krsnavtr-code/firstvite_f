import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaPhone, FaWhatsapp } from "react-icons/fa";
import SEO from "../../components/SEO";

const DataScienceThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  return (
    <>
      <SEO
        title="Thank You | Data Science & AI Programme - Registration Successful"
        description="Thank you for applying to the Data Science & AI Programme! Our counsellor will call you with batch details & EMI options."
        keywords="thank you, data science, AI programme, registration successful, Eklabya"
        robots="noindex, nofollow"
      />
      <div className="min-h-screen bg-gradient-to-br from-[#0B1C3F] via-[#1A3D8F] to-[#0B1C3F] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <FaCheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1C3F] mb-4">
            Application Submitted Successfully!
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            {state?.message || "Thank you for applying to the Data Science & AI Programme! Our counsellor will call you with batch details & EMI options."}
          </p>

          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-[#0B1C3F] mb-4">What happens next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-gray-700">Our counsellor will call you within 24 hours</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-gray-700">You'll receive batch details and EMI options</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-gray-700">Complete your enrollment and start learning</p>
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
              href="https://wa.me/919891030303?text=Hi%2C%20I%20want%20to%20know%20more%20about%20the%20Data%20Science%20%26%20AI%20Programme"
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
              onClick={() => navigate("/data-science-programme")}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Data Science Programme
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataScienceThankYou;
